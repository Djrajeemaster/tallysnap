import { db } from '@/firebaseConfig';
import type { Receipt } from '@/models/receipt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { nanoid } from 'nanoid/non-secure';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './use-auth';

const STORAGE_KEY = '@tallysnap/receipts';

interface ReceiptsContextType {
  receipts: Receipt[];
  addReceipt: (r: Partial<Receipt>) => Promise<Receipt>;
  updateReceipt: (id: string, changes: Partial<Receipt>) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
}

const ReceiptsContext = createContext<ReceiptsContextType | null>(null);

export function ReceiptsProvider({ children }: { children: React.ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setReceipts(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to load receipts', e);
      }
    })();
  }, []);

  // when user signs in, sync remote receipts
  useEffect(() => {
    if (!user || !db) return;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'users', user.uid, 'receipts'));
        const remote: Receipt[] = snap.docs.map(d => d.data() as Receipt);
        // merge remote with local, prefer remote
        setReceipts(remote);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
      } catch (e) {
        console.warn('Failed to sync receipts from cloud', e);
      }
    })();
  }, [user]);

  const persist = async (list: Receipt[]) => {
    setReceipts(list);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save receipts', e);
    }
  };

  const addReceipt = async (r: Partial<Receipt>) => {
    const newItem: Receipt = {
      id: nanoid(),
      rawText: r.rawText || '',
      date: r.date,
      total: r.total,
      vendor: r.vendor,
      category: r.category,
      imageUri: r.imageUri,
    };
    const updated = [newItem, ...receipts];
    await persist(updated);
    if (user && db) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'receipts', newItem.id), newItem);
      } catch (e) {
        console.warn('failed to upload receipt', e);
      }
    }
    return newItem;
  };

  const updateReceipt = async (id: string, changes: Partial<Receipt>) => {
    const updated = receipts.map(r => (r.id === id ? { ...r, ...changes } : r));
    await persist(updated);
    if (user && db) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'receipts', id), changes);
      } catch (e) {
        console.warn('failed to update receipt in cloud', e);
      }
    }
  };

  const deleteReceipt = async (id: string) => {
    console.log('Deleting receipt:', id);
    console.log('Current receipts:', receipts.length);
    const updated = receipts.filter(r => r.id !== id);
    console.log('After filter:', updated.length);
    await persist(updated);
    console.log('Receipt deleted successfully');
    if (user && db) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'receipts', id));
      } catch (e) {
        console.warn('failed to delete receipt from cloud', e);
      }
    }
  };

  return (
    <ReceiptsContext.Provider value={{ receipts, addReceipt, updateReceipt, deleteReceipt }}>
      {children}
    </ReceiptsContext.Provider>
  );
}

export function useReceipts() {
  const ctx = useContext(ReceiptsContext);
  if (!ctx) {
    throw new Error('useReceipts must be used within ReceiptsProvider');
  }
  return ctx;
}
