import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Plus, PiggyBank, Plane, Laptop, Home, Trash2 } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  icon: 'piggy' | 'plane' | 'laptop' | 'home';
  color: string;
  bgColor: string;
}

export const SavingsGoalsPage: React.FC = () => {
  const { settings } = useFinance();
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  const storageKey = `spendwise_goals_${user?.id || 'default'}`;

  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setGoals(saved ? JSON.parse(saved) : []);
    } catch {
      setGoals([]);
    }
  }, [storageKey]);

  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newGoals));
    } catch (e) {
      console.error('Failed to save goals', e);
    }
  };

  const [newGoalName, setNewGoalName] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim() || !newTarget) return;
    const g: Goal = {
      id: Date.now().toString(),
      name: newGoalName.trim(),
      current: 0,
      target: Number(newTarget),
      icon: 'piggy',
      color: '#10B981',
      bgColor: '#E6F4EA',
    };
    saveGoals([...goals, g]);
    setNewGoalName('');
    setNewTarget('');
    setShowAddModal(false);
  };

  const handleDeleteGoal = (id: string) => {
    saveGoals(goals.filter((g) => g.id !== id));
  };

  const renderIcon = (type: Goal['icon']) => {
    switch (type) {
      case 'piggy': return <PiggyBank className="w-5 h-5" />;
      case 'plane': return <Plane className="w-5 h-5" />;
      case 'laptop': return <Laptop className="w-5 h-5" />;
      case 'home': return <Home className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Savings Goals</h1>
          <p className="text-xs text-slate-500 font-medium">Set targets and turn dreams into reality</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#0F6443] hover:bg-[#0b4d33] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Goal Cards List */}
      {goals.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-[#0F6443] flex items-center justify-center">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">No Savings Goals Yet</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Set a target for your emergency fund, vacation, gadgets, or dream home!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#0F6443] hover:bg-[#0b4d33] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Goal</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
            return (
              <div
                key={goal.id}
                className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3 transition hover:border-slate-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: goal.bgColor, color: goal.color }}
                    >
                      {renderIcon(goal.icon)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{goal.name}</h3>
                      <div className="text-xs font-semibold text-slate-600 mt-0.5">
                        <span className="text-emerald-700 font-bold">{settings.currency_symbol}{goal.current.toLocaleString()}</span>
                        <span className="text-slate-400 font-normal"> / {settings.currency_symbol}{goal.target.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                      {pct}%
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-slate-300 hover:text-rose-500 p-1 transition"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#F4F8F5] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-slate-900/40 sm:backdrop-blur-xs animate-in fade-in duration-150">
          <form onSubmit={handleAddGoal} className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-3xl p-6 shadow-2xl border-0 sm:border border-slate-100 space-y-4 overflow-y-auto flex flex-col justify-between sm:justify-start">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:border-0 sm:pb-0">
                <h3 className="font-black text-slate-900 text-base sm:text-lg">Create New Savings Goal</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vacation, Bike, Gold"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F6443] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F6443] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 text-xs text-slate-600 font-bold hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0F6443] hover:bg-[#0b4d33] text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                Create Goal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
