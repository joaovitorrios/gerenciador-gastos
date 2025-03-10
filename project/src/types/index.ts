export interface User {
  id: string;
  email: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  userId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryTotals: {
    category: string;
    total: number;
  }[];
  monthlyData: {
    month: string;
    income: number;
    expense: number;
    balance: number;
  }[];
}