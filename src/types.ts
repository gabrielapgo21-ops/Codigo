export type Frequency = 'daily' | 'weekly' | 'monthly' | 'occasionally';

export interface WorkTask {
  id: string;
  title: string;
  description: string;
  hoursPerWeek: number;
  frequency: Frequency;
  repetitiveness: number; // 0 to 1
}

export interface TaskAnalysis {
  taskId: string;
  automationScore: number; // 0 to 100
  reasoning: string;
  suggestedPrompt: string;
  automationTool: string;
  savingsEstimate: string;
}

export interface UserGoals {
  mainGoal: string;
  focusArea: string;
}

export interface DashboardData {
  tasks: WorkTask[];
  analyses: Record<string, TaskAnalysis>;
}
