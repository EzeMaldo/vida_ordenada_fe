export interface User {
  userId: string;
  name: string;
  email?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: string;
  name: string;
}

export interface AccountDto {
  id: string;
  clientId?: number;
  name: string;
  initialBalance: number;
  accountType: "CASH" | "BANK" | "INVESTMENT" | "CREDIT";
  currency: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface CategoryDto {
  id: string;
  clientId?: number;
  name: string;
  iconName: string;
  colorHex: string;
  type: "INCOME" | "EXPENSE";
  bucket: "FIXED" | "VARIABLE" | "DEBT" | "INVEST";
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface TransactionDto {
  id: string;
  clientId?: number;
  amount: number;
  categoryId: string;
  accountId: string;
  type: "INCOME" | "EXPENSE";
  date: number;
  note?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface SavingsGoalDto {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface FixedExpenseDto {
  id: string;
  name: string;
  emoji: string;
  amount: number;
  recurringType: "INCOME" | "EXPENSE";
  status: "PAID" | "PENDING";
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface ChallengeDto {
  id: string;
  title: string;
  emoji: string;
  description: string;
  isCompleted: boolean;
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface SyncPullResponse {
  transactions: TransactionDto[];
  accounts: AccountDto[];
  categories: CategoryDto[];
  savingsGoals: SavingsGoalDto[];
  fixedExpenses: FixedExpenseDto[];
  challenges: ChallengeDto[];
  serverTime: number;
}

export interface SyncPushItem {
  operation: "INSERT" | "UPDATE" | "DELETE";
  entityType: string;
  clientId: number;
  serverId?: string;
  payload: string;
}

export interface SyncPushResult {
  clientId: number;
  serverId: string;
  status: "ok" | "conflict";
}

export interface SyncData {
  transactions: TransactionDto[];
  accounts: AccountDto[];
  categories: CategoryDto[];
  savingsGoals: SavingsGoalDto[];
  fixedExpenses: FixedExpenseDto[];
  challenges: ChallengeDto[];
  lastSync: number;
}
