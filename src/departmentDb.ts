/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DepartmentItem {
  id: string;
  name: string;
  icon: string;
  isDefault?: boolean;
  isHidden?: boolean;
  isDeleted?: boolean;
  order: number;
}

export const PRELOADED_DEPARTMENTS = [
  { name: 'Radiology', icon: '☢️' },
  { name: 'Cardiology', icon: '🫀' },
  { name: 'Orthopaedics', icon: '🦴' },
  { name: 'Physiotherapy', icon: '🏃' },
  { name: 'ICU & Critical Care', icon: '🚨' },
  { name: 'OT (Operation Theatre)', icon: '😷' },
  { name: 'Laboratory', icon: '🧪' },
  { name: 'Dental', icon: '🦷' },
  { name: 'Ophthalmology', icon: '👁️' },
  { name: 'ENT', icon: '👂' },
  { name: 'Pediatrics', icon: '👶' },
  { name: 'Neonatology', icon: '🍼' },
  { name: 'Gynecology & Obstetrics', icon: '🤰' },
  { name: 'Dialysis', icon: '💉' },
  { name: 'Emergency & Trauma', icon: '🚑' },
  { name: 'CSSD', icon: '🧼' },
  { name: 'Oncology', icon: '🎗️' },
  { name: 'Urology', icon: '💧' },
  { name: 'Neurology', icon: '🧠' },
  { name: 'Pulmonology', icon: '🫁' },
  { name: 'General Equipment', icon: '⚙️' },
  { name: 'Rehabilitation', icon: '🩼' },
  { name: 'Anaesthesia', icon: '💤' },
  { name: 'Blood Bank', icon: '🩸' },
  { name: 'Gastroenterology', icon: '🥩' },
  { name: 'Nephrology', icon: '🌀' },
  { name: 'Psychiatry', icon: '🗣️' },
  { name: 'Dermatology', icon: '🧴' },
  { name: 'Endoscopy', icon: '🔬' },
  { name: 'Pathology', icon: '🧫' },
  { name: 'Neurosurgery', icon: '🧠⚡' },
  { name: 'Plastic Surgery', icon: '✨' },
  { name: 'Cardiothoracic Surgery (CTVS)', icon: '❤️‍🩹' },
  { name: 'Nuclear Medicine', icon: '⚛️' },
  { name: 'Forensic Medicine', icon: '🕵️' },
  { name: 'Community Medicine', icon: '🏡' },
  { name: 'Microbiology', icon: '🦠' },
  { name: 'Biochemistry', icon: '🧪🧬' },
  { name: 'Pharmacology', icon: '💊' },
  { name: 'Radiotherapy', icon: '⚡' },
  { name: 'Burn Unit', icon: '🔥' },
  { name: 'Transfusion Medicine', icon: '🪶' },
  { name: 'Sports Medicine', icon: '👟' },
  { name: 'Pain Management', icon: '🎯' },
  { name: 'IVF & Fertility', icon: '🌱' },
  { name: 'Robotics Surgery', icon: '🤖' },
  { name: 'Telemedicine', icon: '💻' },
  { name: 'Biomedical Engineering', icon: '🔧' },
  { name: 'Central Store', icon: '📦' },
  { name: 'Hospital Administration', icon: '🏢' },
  { name: 'Infection Control', icon: '🧼' },
  { name: 'Medical Gas Pipeline System (MGPS)', icon: '💨' },
  { name: 'Laundry & Linen', icon: '🧺' },
  { name: 'Kitchen & Dietary', icon: '🍎' },
  { name: 'Ambulance Services', icon: '🚑' },
  { name: 'Medical Education', icon: '📚' },
  { name: 'Trauma Center', icon: '🏥' },
  { name: 'Vaccination Unit', icon: '💉' },
  { name: 'Cath Lab', icon: '🫀⚡' },
  { name: 'Modular OT', icon: '🚪' },
  { name: 'Mortuary', icon: '⚰️' },
  { name: 'Pharmacy', icon: '💊🛒' },
  { name: 'Nursing Department', icon: '🧑‍⚕️' },
  { name: 'Health IT', icon: '🖥️' },
  { name: 'Research Department', icon: '🔬📊' },
  { name: 'Public Health', icon: '🗃️' },
  { name: 'Physiological Lab', icon: '📈' },
  { name: 'Audio Visual Unit', icon: '📹' },
  { name: 'Oxygen Plant', icon: '🌬️' },
  { name: 'ECG Unit', icon: '📈💓' },
  { name: 'ICU Transport', icon: '🛏️' },
  { name: 'Biomedical Waste Management', icon: '☣️' },
  { name: 'Sanitation Department', icon: '🧹' },
  { name: 'Health Screening Unit', icon: '🩺' },
  { name: 'Mobile Medical Unit', icon: '🛞' },
  { name: 'Skill Lab', icon: '🎓' },
  { name: 'Simulation Lab', icon: '🎮' },
  { name: 'ECHO Unit', icon: '📡' },
  { name: 'Blood Collection Unit', icon: '💉🩸' },
  { name: 'Viral Research Lab', icon: '🧪🦠' },
  { name: 'TB & Chest Department', icon: '🫁💨' },
  { name: 'Leprosy Unit', icon: '🩹' },
  { name: 'Mental Health Unit', icon: '🧠☮️' },
  { name: 'Immunization Department', icon: '🛡️' }
];

const MANAGED_DEPS_STORAGE_KEY = 'bmsicl_managed_departments_v2';

/**
 * Initializes and retrieves the managed departments list.
 * Merges old custom departments if they exist.
 */
export function getManagedDepartments(): DepartmentItem[] {
  try {
    const stored = localStorage.getItem(MANAGED_DEPS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as DepartmentItem[];
      if (parsed && parsed.length > 0) {
        // Return sorted by order ascending
        return parsed.sort((a, b) => a.order - b.order);
      }
    }
  } catch (e) {
    console.error('Error parsing managed departments:', e);
  }

  // If no managed list, initialize with PRELOADED list
  const initialList: DepartmentItem[] = PRELOADED_DEPARTMENTS.map((d, index) => ({
    id: `preloaded_${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    name: d.name,
    icon: d.icon,
    isDefault: true,
    isHidden: false,
    isDeleted: false,
    order: index
  }));

  // Also import any old legacy custom departments if they exist
  try {
    const legacyStored = localStorage.getItem('bmsicl_custom_departments');
    if (legacyStored) {
      const legacyParsed = JSON.parse(legacyStored);
      if (Array.isArray(legacyParsed)) {
        legacyParsed.forEach((item, index) => {
          if (item && item.name) {
            const trimmedName = item.name.trim();
            // check for duplicates
            const dup = initialList.some(d => d.name.toLowerCase() === trimmedName.toLowerCase());
            if (!dup) {
              initialList.push({
                id: `custom_${Date.now()}_${index}`,
                name: trimmedName,
                icon: item.icon || '🏛️',
                isDefault: false,
                isHidden: false,
                isDeleted: false,
                order: initialList.length
              });
            }
          }
        });
      }
    }
  } catch (e) {
    console.error('Error importing legacy departments:', e);
  }

  // Save initialized list
  saveManagedDepartments(initialList);
  return initialList;
}

/**
 * Save the managed departments to local storage.
 */
export function saveManagedDepartments(departments: DepartmentItem[]): void {
  try {
    // Ensure accurate field properties and sort by order
    const ordered = departments.map((d, idx) => ({ ...d, order: d.order ?? idx }));
    localStorage.setItem(MANAGED_DEPS_STORAGE_KEY, JSON.stringify(ordered));
  } catch (e) {
    console.error('Error saving managed departments:', e);
  }
}

/**
 * Resolves the icon for a given department name.
 */
export function getDepartmentIcon(deptName: string, managedDepts?: DepartmentItem[]): string {
  const nameToMatch = (deptName || 'General').trim().toLowerCase();
  
  const list = managedDepts || getManagedDepartments();
  const found = list.find(d => d.name.toLowerCase() === nameToMatch);
  if (found) return found.icon;

  return '🏛️';
}
