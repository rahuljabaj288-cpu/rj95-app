/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Check,
  X,
  AlertTriangle,
  FileText,
  Bookmark,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { DepartmentItem, getManagedDepartments, saveManagedDepartments } from '../utils/departmentDb';
import { Language } from '../types';

interface DepartmentManagementProps {
  key?: React.Key;
  lang: Language;
  onRenameDepartment: (oldName: string, newName: string) => void;
  onRefreshDropdowns: () => void;
}

const MEDICAL_EMOJIS = [
  '🏛️', '⚕️', '🏥', '🔬', '🧪', '🧬', '☢️', '🫀', '🦴', '🏃', '🚨', '😷', '🦷', '👁️', '👂',
  '👶', '🍼', '🤰', '💉', '🚑', '🧼', '🎗️', '💧', '🧠', '🫁', '⚙️', '🩼', '💤', '🩸', '🥩',
  '🌀', '🗣️', '🧴', '🧫', '✨', '❤️‍🩹', '🕵️', '🏡', '🦠', '💊', '⚡', '🔥', '🪶', '👟', '🎯',
  '🌱', '🤖', '💻', '🔧', '📦', '🏢', '💨', '🧺', '🍎', '📚', '🚪', '⚰️', '🛒', '🧑‍⚕️', '🖥️',
  '📊', '🗃️', '📈', '📹', '🌬️', '💓', '🛏️', '☣️', '🧹', '🩺', '🛞', '🎓', '🎮', '📡', '🛡️',
  '🩹', '☮️', '🩺'
];

export default function DepartmentManagement({
  lang,
  onRenameDepartment,
  onRefreshDropdowns
}: DepartmentManagementProps) {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [search, setSearch] = useState('');
  
  // Status flags for popups
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingIcon, setEditingIcon] = useState('🏛️');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🏥');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load departments on mount
  useEffect(() => {
    loadDbs();
  }, []);

  const loadDbs = () => {
    const list = getManagedDepartments();
    // Sort logic handled in getManagedDepartments but let's be double sure
    setDepartments([...list].sort((a, b) => a.order - b.order));
  };

  const notify = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleToggleHide = (id: string) => {
    const updated = departments.map(d => {
      if (d.id === id) {
        return { ...d, isHidden: !d.isHidden };
      }
      return d;
    });
    setDepartments(updated);
    saveManagedDepartments(updated);
    onRefreshDropdowns();
    notify(lang === 'en' ? 'Visibility updated successfully.' : 'दृश्यता बदल दी गई है।', 'success');
  };

  const handleDelete = (dept: DepartmentItem) => {
    if (dept.isDefault) {
      if (!window.confirm(lang === 'en' 
        ? `⚠️ "${dept.name}" is a protected preloaded department. Deleting it will soft-delete it, but you can restore it anytime using the "Restore Deleted Defaults" button. Are you sure you want to proceed?`
        : `⚠️ "${dept.name}" एक पूर्व-लोड किया गया सुरक्षित विभाग है। इसे हटाने पर यह सॉफ्ट-डिलीट हो जाएगा, लेकिन आप इसे वापस रीस्टोर कर सकते हैं। क्या आप जारी रखना चाहते हैं?`
      )) {
        return;
      }
    } else {
      if (!window.confirm(lang === 'en'
        ? `Are you sure you want to delete the department "${dept.name}" permanently?`
        : `क्या आप विभाग "${dept.name}" को स्थायी रूप से हटाना चाहते हैं?`
      )) {
        return;
      }
    }

    let updated: DepartmentItem[];
    if (dept.isDefault) {
      // Soft-delete
      updated = departments.map(d => {
        if (d.id === dept.id) {
          return { ...d, isDeleted: true };
        }
        return d;
      });
    } else {
      // Hard delete custom
      updated = departments.filter(d => d.id !== dept.id);
    }

    // Reorder remaining items
    const reordered = updated
      .filter(d => !d.isDeleted)
      .map((d, index) => ({ ...d, order: index }))
      .concat(updated.filter(d => d.isDeleted));

    setDepartments(reordered);
    saveManagedDepartments(reordered);
    onRefreshDropdowns();
    notify(lang === 'en' ? 'Department removed successfully.' : 'विभाग सफलतापूर्वक हटा दिया गया है।', 'success');
  };

  const handleRestoreDeletedDefaults = () => {
    const hasDeleted = departments.some(d => d.isDeleted && d.isDefault);
    if (!hasDeleted) {
      notify(lang === 'en' ? 'No deleted default departments to restore.' : 'पुनर्स्थापित करने के लिए कोई सुरक्षित विभाग नहीं है।', 'error');
      return;
    }

    const updated = departments.map(d => {
      if (d.isDefault && d.isDeleted) {
        return { ...d, isDeleted: false, isHidden: false };
      }
      return d;
    });

    const activeList = updated.filter(d => !d.isDeleted).map((d, idx) => ({ ...d, order: idx }));
    const deletedList = updated.filter(d => d.isDeleted);
    const final = [...activeList, ...deletedList];

    setDepartments(final);
    saveManagedDepartments(final);
    onRefreshDropdowns();
    notify(lang === 'en' ? 'All default departments restored successfully.' : 'सभी पूर्व-लोड किए गए सुरक्षित विभाग पुनर्स्थापित कर दिए गए हैं।', 'success');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    // Get list of active departments to swap within
    const active = departments.filter(d => !d.isDeleted);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= active.length) return;

    // Swap order
    const a = active[index];
    const b = active[targetIdx];

    const tempOrder = a.order;
    a.order = b.order;
    b.order = tempOrder;

    // Put them back together
    const deleted = departments.filter(d => d.isDeleted);
    const combined = [...active].sort((x, y) => x.order - y.order).concat(deleted);

    setDepartments(combined);
    saveManagedDepartments(combined);
    onRefreshDropdowns();
  };

  const handleOpenAdd = () => {
    setNewName('');
    setNewIcon('🏥');
    setIsAddOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newName.trim();
    if (!cleanName) return;

    // Check for duplicates
    const isDuplicate = departments.some(
      d => !d.isDeleted && d.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (isDuplicate) {
      notify(lang === 'en' 
        ? 'Duplicate department name is not allowed!' 
        : 'समान विभाग का नाम पहले से मौजूद है!', 'error');
      return;
    }

    // Check if was previously soft-deleted preloaded
    const softDeleted = departments.find(
      d => d.isDeleted && d.name.toLowerCase() === cleanName.toLowerCase()
    );

    let updated: DepartmentItem[];
    if (softDeleted) {
      updated = departments.map(d => {
        if (d.id === softDeleted.id) {
          return { ...d, isDeleted: false, icon: newIcon, isHidden: false };
        }
        return d;
      });
      notify(lang === 'en' ? 'Restored previously disabled default department.' : 'पूर्व अक्षम विभाग रीस्टोर कर दिया गया।', 'success');
    } else {
      const activeCount = departments.filter(d => !d.isDeleted).length;
      const newDept: DepartmentItem = {
        id: `custom_${Date.now()}`,
        name: cleanName,
        icon: newIcon,
        isDefault: false,
        isHidden: false,
        isDeleted: false,
        order: activeCount
      };
      
      updated = [
        ...departments.filter(d => !d.isDeleted),
        newDept,
        ...departments.filter(d => d.isDeleted)
      ];
      notify(lang === 'en' ? 'New department added successfully.' : 'नया विभाग सफलतापूर्वक जोड़ दिया गया है।', 'success');
    }

    // Reorder
    const reordered = updated.map((d, index) => ({ ...d, order: index }));

    setDepartments(reordered);
    saveManagedDepartments(reordered);
    onRefreshDropdowns();
    setIsAddOpen(false);
  };

  const handleOpenEdit = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setEditingName(dept.name);
    setEditingIcon(dept.icon);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;

    const cleanName = editingName.trim();
    if (!cleanName) return;

    // Verify duplicate with others (not self)
    const isDuplicate = departments.some(
      d => d.id !== editingDept.id && !d.isDeleted && d.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (isDuplicate) {
      notify(lang === 'en' 
        ? 'Another active department already has this name!' 
        : 'इस नाम का दूसरा सक्रिय विभाग पहले से मौजूद है!', 'error');
      return;
    }

    const oldName = editingDept.name;
    const newNameVal = cleanName;

    // Update state
    const updated = departments.map(d => {
      if (d.id === editingDept.id) {
        return { ...d, name: newNameVal, icon: editingIcon };
      }
      return d;
    });

    setDepartments(updated);
    saveManagedDepartments(updated);

    // Call update callback to update all existing tenders in physical state
    if (oldName.toLowerCase() !== newNameVal.toLowerCase()) {
      onRenameDepartment(oldName, newNameVal);
    }

    onRefreshDropdowns();
    setIsEditOpen(false);
    notify(lang === 'en' ? 'Department updated successfully.' : 'विभाग का विवरण अद्यतित कर दिया गया है।', 'success');
  };

  // Filter display list
  const activeDepartments = departments.filter(d => !d.isDeleted);
  const searchedActive = activeDepartments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-sm text-slate-800 dark:text-slate-100 overflow-hidden animate-fadeIn select-none">
      {/* Panel Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 flex items-center gap-1.5 uppercase tracking-tight">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>
              {lang === 'en' ? 'Medical Department Management' : 'चिकित्सा विभाग प्रबंधन'}
            </span>
          </h3>
          <p className="text-[10px] text-slate-500">
            {lang === 'en' 
              ? 'Add, edit, rearrange, or configure icons and visibility of health facility departments across the procurement ledger.' 
              : 'निविदा प्रणाली में उपयोग किए जाने वाले विभागों को जोड़ें, संपादित करें, या क्रम बदलें।'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Restore Deleted Defaults Indicator */}
          <button
            onClick={handleRestoreDeletedDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-305 rounded-xl text-3xs font-extrabold uppercase tracking-widest cursor-pointer transition-all active:scale-[0.98]"
            title="Restore deleted default preloaded departments"
          >
            <RotateCcw className="w-3 h-3 text-blue-500" />
            <span>{lang === 'en' ? 'Restore Defaults' : 'डिफ़ॉल्ट पुनर्स्थापित'}</span>
          </button>

          {/* Add New Trigger */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-3xs font-black uppercase tracking-widest cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Add Department' : 'विभाग जोड़ें'}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mx-5 my-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="mx-5 my-3 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900 rounded-xl text-xs flex items-center gap-2">
          <X className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Operations Search Row */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-850/60 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute inset-y-0 left-3 my-auto w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'en' ? 'Quick search departments...' : 'खोजें...'}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-705 dark:placeholder:text-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 text-left"
          />
        </div>
        
        <div className="text-3xs font-mono font-bold text-slate-400">
          {searchedActive.length} OF {activeDepartments.length} {lang === 'en' ? 'ACTIVE DEPARTMENTS' : 'सक्रिय विभाग'}
        </div>
      </div>

      {/* Scrollable Department list */}
      <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-[420px] overflow-y-auto overflow-x-hidden">
        {searchedActive.length > 0 ? (
          searchedActive.map((dept, index) => {
            const isFirst = index === 0;
            const isLast = index === searchedActive.length - 1;

            return (
              <div
                key={dept.id}
                className={`p-3 sm:px-5 flex items-center justify-between gap-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-950/15 ${
                  dept.isHidden ? 'bg-slate-50/45 dark:bg-slate-950/5 opacity-70' : ''
                }`}
              >
                {/* Department Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg bg-slate-100 dark:bg-slate-800/80 p-2 rounded-xl shrink-0 select-none block w-10 h-10 text-center leading-6 shadow-sm border border-slate-200/20">
                    {dept.icon}
                  </span>
                  <div className="truncate text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-150 truncate">
                        {dept.name}
                      </span>
                      {dept.isDefault ? (
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-850 text-slate-500 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest border border-slate-200/10">
                          {lang === 'en' ? 'Default' : 'सुरक्षित'}
                        </span>
                      ) : (
                        <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                          {lang === 'en' ? 'Custom' : 'कस्टम'}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-mono">
                      ID: {dept.id} • Order ID: {dept.order}
                    </p>
                  </div>
                </div>

                {/* Interactive Operations panel */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Sorting Rearranger buttons */}
                  {!search && (
                    <div className="flex items-center mr-2 border-r border-slate-150 dark:border-slate-800 pr-2 gap-0.5">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMove(index, 'up')}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isFirst
                            ? 'opacity-30 border-slate-100 dark:border-slate-850 text-slate-300'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-650 hover:text-blue-500'
                        }`}
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMove(index, 'down')}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isLast
                            ? 'opacity-30 border-slate-100 dark:border-slate-850 text-slate-300'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-650 hover:text-blue-500'
                        }`}
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Hide / Unhide Switcher */}
                  <button
                    type="button"
                    onClick={() => handleToggleHide(dept.id)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      dept.isHidden
                        ? 'bg-amber-500/10 border-amber-300/40 text-amber-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-855 text-slate-400 hover:text-slate-200'
                    }`}
                    title={dept.isHidden ? 'Unhide Department' : 'Hide from Selection Dropdowns'}
                  >
                    {dept.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  {/* Edit Option */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(dept)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-855 text-slate-505 dark:text-slate-405 hover:text-blue-500 transition-colors cursor-pointer"
                    title="Edit name or icon"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete trigger */}
                  <button
                    type="button"
                    onClick={() => handleDelete(dept)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 hover:border-rose-105 hover:text-rose-500 dark:hover:bg-rose-950/45 text-rose-455 transition-colors cursor-pointer"
                    title="Delete Department"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-10 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <Layers className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-xs font-semibold uppercase tracking-wider">
              {lang === 'en' ? 'No departments match search query' : 'कोई विभाग नहीं मिला'}
            </p>
          </div>
        )}
      </div>

      {/* Add Popup Modal Window */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="text-sm font-black text-slate-950 dark:text-slate-50 uppercase tracking-tight flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-850">
              <Plus className="w-4 h-4 text-blue-550" />
              <span>{lang === 'en' ? 'Add Healthcare Department' : 'नया चिकित्सा विभाग जोड़ें'}</span>
            </h4>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4 text-left">
              <div className="space-y-1">
                <label className="block text-3xs font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider">
                  {lang === 'en' ? 'Department Name' : 'विभाग का नाम'} *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Cardiology, Outpatient Care"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                  autoFocus
                />
              </div>

              {/* Emoji selector Grid */}
              <div className="space-y-1.5">
                <label className="block text-3xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                  {lang === 'en' ? 'Select Department Icon' : 'विभाग का आइकन चुनें'}
                </label>
                <div className="text-xl p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-850 text-center flex items-center justify-center gap-2">
                  <span className="text-2xl p-1 bg-white dark:bg-slate-900 rounded-xl border shadow-sm w-12 h-12 flex items-center justify-center">{newIcon}</span>
                  <span className="text-2xs font-bold text-slate-500">{lang === 'en' ? 'Selected Icon' : 'चयनित आइकन'}</span>
                </div>

                <div className="grid grid-cols-8 gap-1 p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-850 max-h-36 overflow-y-auto">
                  {MEDICAL_EMOJIS.map(emO => (
                    <button
                      key={emO}
                      type="button"
                      onClick={() => setNewIcon(emO)}
                      className={`text-lg p-1 hover:bg-slate-250 hover:bg-indigo-50 hover:scale-[1.1] transition-all rounded-lg cursor-pointer ${
                        newIcon === emO ? 'bg-indigo-100/60 dark:bg-indigo-950 border border-indigo-300' : ''
                      }`}
                    >
                      {emO}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {lang === 'en' ? 'Cancel' : 'रद्द करें'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                >
                  {lang === 'en' ? 'Save & Add' : 'महफूज करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Popup Modal Window */}
      {isEditOpen && editingDept && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="text-sm font-black text-slate-950 dark:text-slate-50 uppercase tracking-tight flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-855">
              <Edit className="w-4 h-4 text-indigo-500" />
              <span>{lang === 'en' ? 'Edit Department Details' : 'विभाग विवरण संपादित करें'}</span>
            </h4>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 text-left">
              <div className="space-y-1">
                <label className="block text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {lang === 'en' ? 'Department Name' : 'विभाग का नाम'} *
                </label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                  autoFocus
                />
                <p className="text-[9px] text-slate-400 mt-1 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 w-3 text-amber-500 shrink-0" />
                  <span>
                    {lang === 'en' 
                      ? 'Note: Renaming will automatically update all existing Tenders under this name.' 
                      : 'सूचना: नाम बदलने पर इस विभाग की सभी निविदाएं स्वचालित रूप से अद्यतन हो जाएंगी।'}
                  </span>
                </p>
              </div>

              {/* Emoji selector Grid */}
              <div className="space-y-1.5">
                <label className="block text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {lang === 'en' ? 'Select Department Icon' : 'आइकन बदलें'}
                </label>
                <div className="text-xl p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-850 text-center flex items-center justify-center gap-2">
                  <span className="text-2xl p-1 bg-white dark:bg-slate-900 rounded-xl border shadow-sm w-12 h-12 flex items-center justify-center">{editingIcon}</span>
                  <span className="text-2xs font-bold text-slate-500">{lang === 'en' ? 'Selected Icon' : 'चयनित आइकन'}</span>
                </div>

                <div className="grid grid-cols-8 gap-1 p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-850 max-h-36 overflow-y-auto">
                  {MEDICAL_EMOJIS.map(emO => (
                    <button
                      key={emO}
                      type="button"
                      onClick={() => setEditingIcon(emO)}
                      className={`text-lg p-1 hover:bg-slate-250 hover:bg-indigo-50 hover:scale-[1.1] transition-all rounded-lg cursor-pointer ${
                        editingIcon === emO ? 'bg-indigo-150/60 dark:bg-indigo-950 border border-indigo-305' : ''
                      }`}
                    >
                      {emO}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-slate-202 dark:border-slate-800 text-slate-605 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {lang === 'en' ? 'Cancel' : 'रद्द करें'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                >
                  {lang === 'en' ? 'Apply changes' : 'अद्यतन करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
