import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  doc, 
  updateDoc,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { BugReport } from '../types';

const COLLECTION_NAME = 'bug_reports';

export class BugReportService {
  // Create a new bug/feature report
  static async createReport(data: {
    user_id: string;
    user_name: string;
    user_email: string;
    type: 'bug' | 'feature';
    title: string;
    description: string;
  }): Promise<boolean> {
    try {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        status: 'open',
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error creating report:', error);
      return false;
    }
  }

  // Get all bug reports (admin only)
  static async getAllReports(): Promise<BugReport[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
        resolved_at: doc.data().resolved_at?.toDate()
      })) as BugReport[];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  // Get reports by status
  static async getReportsByStatus(status: string): Promise<BugReport[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', status),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
        resolved_at: doc.data().resolved_at?.toDate()
      })) as BugReport[];
    } catch (error) {
      console.error('Error fetching reports by status:', error);
      return [];
    }
  }

  // Update report status
  static async updateReportStatus(
    reportId: string,
    status: 'open' | 'in-progress' | 'resolved' | 'closed',
    adminId?: string,
    adminNotes?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: Timestamp.now()
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = Timestamp.now();
        if (adminId) {
          updateData.resolved_by = adminId;
        }
      }

      await updateDoc(doc(db, COLLECTION_NAME, reportId), updateData);
      return true;
    } catch (error) {
      console.error('Error updating report status:', error);
      return false;
    }
  }

  // Update priority
  static async updatePriority(
    reportId: string,
    priority: 'low' | 'medium' | 'high'
  ): Promise<boolean> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, reportId), {
        priority,
        updated_at: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating priority:', error);
      return false;
    }
  }
}
