<template>
  <div class="manual-dose-form bg-gray-900 p-6 rounded-lg">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold text-blue-400">Manual Dose Reading Entry</h3>
      <button 
        @click="$emit('close')" 
        class="text-gray-400 hover:text-gray-300 transition-colors"
      >
        <i class="fas fa-times text-xl"></i>
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Device Selection -->
      <div class="form-group">
        <label class="block text-gray-300 text-sm font-bold mb-2">
          Device Serial Number *
        </label>
        <select 
          v-model="form.device_serial" 
          @change="onDeviceChange" 
          required
          class="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Device</option>
          <option 
            v-for="device in availableDevices" 
            :key="device.serial" 
            :value="device.serial"
          >
            {{ device.serial }} - {{ device.model_name }} 
            <span v-if="device.assigned_personnel">
              ({{ device.assigned_personnel }})
            </span>
          </option>
        </select>
        <div v-if="deviceError" class="text-red-400 text-sm mt-1">{{ deviceError }}</div>
      </div>

      <!-- Personnel Info (Auto-populated) -->
      <div v-if="assignedPersonnel" class="form-group">
        <label class="block text-gray-300 text-sm font-bold mb-2">Assigned Personnel</label>
        <div class="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100">
          {{ assignedPersonnel.name }} ({{ assignedPersonnel.rank_rate }})
        </div>
      </div>

      <!-- Measurement Details Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="block text-gray-300 text-sm font-bold mb-2">
            Measurement Date/Time *
          </label>
          <input 
            type="datetime-local" 
            v-model="form.measured_ts" 
            required 
            class="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-if="dateError" class="text-red-400 text-sm mt-1">{{ dateError }}</div>
        </div>

        <div class="form-group">
          <label class="block text-gray-300 text-sm font-bold mb-2">Battery %</label>
          <input 
            type="number" 
            v-model="form.battery_pct" 
            min="0" 
            max="100" 
            step="1"
            class="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-if="batteryWarning" class="text-yellow-400 text-sm mt-1">{{ batteryWarning }}</div>
        </div>
      </div>

      <!-- Dose Values Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-group">
          <label class="block text-gray-300 text-sm font-bold mb-2">
            HP(10) Dose (mSv) *
          </label>
          <input 
            type="number" 
            v-model="form.hp10_mSv" 
            step="0.001" 
            min="0"
            required 
            class="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-if="hp10Error" class="text-red-400 text-sm mt-1">{{ hp10Error }}</div>
          <div v-if="hp10Warning" class="text-yellow-400 text-sm mt-1">{{ hp10Warning }}</div>
        </div>

        <div class="form-group">
          <label class="block text-gray-300 text-sm font-bold mb-2">HP(0.07) Dose (mSv)</label>
          <input 
            type="number" 
            v-model="form.hp007_mSv" 
            step="0.001" 
            min="0"
            class="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-if="hp007Error" class="text-red-400 text-sm mt-1">{{ hp007Error }}</div>
        </div>

        <div class="form-group">
          <label class="block text-gray-300 text-sm font-bold mb-2">Dose Rate (µSv/h)</label>
          <input 
            type="number" 
            v-model="form.rate_uSv_h" 
            step="0.01" 
            min="0"
            class="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-if="rateError" class="text-red-400 text-sm mt-1">{{ rateError }}</div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="form-group">
        <label class="block text-gray-300 text-sm font-bold mb-2">Location/Notes</label>
        <textarea 
          v-model="form.notes" 
          rows="3"
          placeholder="Enter location, conditions, or additional notes..."
          class="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        ></textarea>
      </div>

      <!-- Data Source Indicator -->
      <div class="form-group">
        <div class="flex items-center space-x-2 text-sm text-gray-400">
          <i class="fas fa-keyboard"></i>
          <span>Data Source: Manual Entry</span>
          <span v-if="form.entered_by" class="text-gray-300">
            by {{ form.entered_by }}
          </span>
        </div>
      </div>

      <!-- Validation Messages -->
      <div v-if="validationErrors.length > 0" class="validation-errors bg-red-900 border border-red-600 rounded-lg p-4">
        <h4 class="text-red-300 font-bold mb-2">Please correct the following errors:</h4>
        <ul class="list-disc list-inside text-red-200 space-y-1">
          <li v-for="error in validationErrors" :key="error">{{ error }}</li>
        </ul>
      </div>

      <!-- Warnings -->
      <div v-if="validationWarnings.length > 0" class="validation-warnings bg-yellow-900 border border-yellow-600 rounded-lg p-4">
        <h4 class="text-yellow-300 font-bold mb-2">Warnings:</h4>
        <ul class="list-disc list-inside text-yellow-200 space-y-1">
          <li v-for="warning in validationWarnings" :key="warning">{{ warning }}</li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions flex justify-end space-x-4 pt-4 border-t border-gray-700">
        <button 
          type="button" 
          @click="saveDraft" 
          :disabled="!isFormValid"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <i class="fas fa-save mr-2"></i>
          Save Draft
        </button>
        
        <button 
          type="button" 
          @click="resetForm"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
        >
          <i class="fas fa-undo mr-2"></i>
          Reset Form
        </button>
        
        <button 
          type="submit" 
          :disabled="!isFormValid || submitting"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <i v-if="submitting" class="fas fa-spinner fa-spin mr-2"></i>
          <i v-else class="fas fa-paper-plane mr-2"></i>
          {{ submitting ? 'Submitting...' : 'Submit Reading' }}
        </button>
      </div>
    </form>

    <!-- Success Message -->
    <div v-if="successMessage" class="mt-4 p-4 bg-green-900 border border-green-600 rounded-lg">
      <div class="flex items-center">
        <i class="fas fa-check-circle text-green-400 mr-2"></i>
        <span class="text-green-200">{{ successMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ManualDoseReadingForm',
  props: {
    devices: {
      type: Array,
      default: () => []
    },
    personnel: {
      type: Array,
      default: () => []
    },
    currentUser: {
      type: String,
      default: 'System User'
    }
  },
  emits: ['close', 'saved', 'error'],
  data() {
    return {
      form: {
        device_serial: '',
        measured_ts: '',
        hp10_mSv: '',
        hp007_mSv: '',
        rate_uSv_h: '',
        battery_pct: '',
        notes: '',
        entered_by: this.currentUser,
        data_source: 'MANUAL'
      },
      assignments: [],
      submitting: false,
      successMessage: '',
      validationErrors: [],
      validationWarnings: [],
      deviceError: '',
      dateError: '',
      hp10Error: '',
      hp007Error: '',
      rateError: '',
      batteryWarning: '',
      hp10Warning: ''
    }
  },
  computed: {
    availableDevices() {
      return this.devices
        .filter(device => device.retired_at === null)
        .map(device => {
          const assignment = this.assignments.find(a => 
            a.device_id === device.id && 
            (!a.end_ts || new Date(a.end_ts) > new Date())
          );
          const assignedPersonnel = assignment ? 
            this.personnel.find(p => p.id === assignment.personnel_id) : null;
          
          return {
            ...device,
            model_name: `${device.vendor} ${device.model}`, // Fix model_name
            assigned_personnel: assignedPersonnel ? 
              `${assignedPersonnel.fname} ${assignedPersonnel.lname}` : null
          };
        });
    },
    
    assignedPersonnel() {
      if (!this.form.device_serial) return null;
      
      const device = this.devices.find(d => d.serial === this.form.device_serial);
      if (!device) return null;
      
      const assignment = this.assignments.find(a => 
        a.device_id === device.id && 
        (!a.end_ts || new Date(a.end_ts) > new Date())
      );
      
      if (!assignment) return null;
      
      const person = this.personnel.find(p => p.id === assignment.personnel_id);
      return person ? {
        name: `${person.fname} ${person.lname}`,
        rank_rate: person.rank_rate
      } : null;
    },
    
    isFormValid() {
      return this.form.device_serial && 
             this.form.measured_ts && 
             this.form.hp10_mSv !== '' &&
             this.validationErrors.length === 0;
    }
  },
  watch: {
    'form.device_serial'() {
      this.validateDevice();
    },
    'form.measured_ts'() {
      this.validateDate();
    },
    'form.hp10_mSv'() {
      this.validateHP10();
    },
    'form.hp007_mSv'() {
      this.validateHP007();
    },
    'form.rate_uSv_h'() {
      this.validateRate();
    },
    'form.battery_pct'() {
      this.validateBattery();
    }
  },
  mounted() {
    // Set default timestamp to current time
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.form.measured_ts = now.toISOString().slice(0, 16);
    
    // Load assignments data
    this.loadAssignments();
  },
  methods: {
    async loadAssignments() {
      try {
        const response = await fetch('/api/radiation/assignments?active_only=true');
        if (response.ok) {
          this.assignments = await response.json();
        }
      } catch (error) {
        console.error('Failed to load assignments:', error);
      }
    },
    
    onDeviceChange() {
      this.validateDevice();
      this.validateAll();
    },
    
    validateDevice() {
      this.deviceError = '';
      if (!this.form.device_serial) {
        this.deviceError = 'Please select a device';
        return false;
      }
      
      const device = this.devices.find(d => d.serial === this.form.device_serial);
      if (!device) {
        this.deviceError = 'Selected device not found';
        return false;
      }
      
      if (device.retired_at) {
        this.deviceError = 'Selected device is retired';
        return false;
      }
      
      return true;
    },
    
    validateDate() {
      this.dateError = '';
      if (!this.form.measured_ts) {
        this.dateError = 'Measurement date/time is required';
        return false;
      }
      
      const measuredDate = new Date(this.form.measured_ts);
      const now = new Date();
      
      if (measuredDate > now) {
        this.dateError = 'Measurement date cannot be in the future';
        return false;
      }
      
      // Check if reading is more than 7 days old
      const daysDiff = (now - measuredDate) / (1000 * 60 * 60 * 24);
      if (daysDiff > 7) {
        this.validationWarnings.push('Reading is more than 7 days old');
      }
      
      return true;
    },
    
    validateHP10() {
      this.hp10Error = '';
      this.hp10Warning = '';
      
      if (this.form.hp10_mSv === '') {
        this.hp10Error = 'HP(10) dose is required';
        return false;
      }
      
      const value = parseFloat(this.form.hp10_mSv);
      if (isNaN(value)) {
        this.hp10Error = 'HP(10) dose must be a valid number';
        return false;
      }
      
      if (value < 0) {
        this.hp10Error = 'HP(10) dose cannot be negative';
        return false;
      }
      
      if (value > 1000) {
        this.hp10Error = 'HP(10) dose exceeds maximum expected value (1000 mSv)';
        return false;
      }
      
      if (value > 0.1) {
        this.hp10Warning = 'HP(10) dose exceeds 100 µSv threshold - alert will be generated';
      }
      
      return true;
    },
    
    validateHP007() {
      this.hp007Error = '';
      
      if (this.form.hp007_mSv === '') return true;
      
      const value = parseFloat(this.form.hp007_mSv);
      if (isNaN(value)) {
        this.hp007Error = 'HP(0.07) dose must be a valid number';
        return false;
      }
      
      if (value < 0) {
        this.hp007Error = 'HP(0.07) dose cannot be negative';
        return false;
      }
      
      if (value > 1000) {
        this.hp007Error = 'HP(0.07) dose exceeds maximum expected value (1000 mSv)';
        return false;
      }
      
      return true;
    },
    
    validateRate() {
      this.rateError = '';
      
      if (this.form.rate_uSv_h === '') return true;
      
      const value = parseFloat(this.form.rate_uSv_h);
      if (isNaN(value)) {
        this.rateError = 'Dose rate must be a valid number';
        return false;
      }
      
      if (value < 0) {
        this.rateError = 'Dose rate cannot be negative';
        return false;
      }
      
      if (value > 100000) {
        this.rateError = 'Dose rate exceeds maximum expected value (100,000 µSv/h)';
        return false;
      }
      
      return true;
    },
    
    validateBattery() {
      this.batteryWarning = '';
      
      if (this.form.battery_pct === '') return true;
      
      const value = parseFloat(this.form.battery_pct);
      if (isNaN(value)) {
        this.batteryWarning = 'Battery percentage must be a valid number';
        return false;
      }
      
      if (value < 0 || value > 100) {
        this.batteryWarning = 'Battery percentage must be between 0 and 100';
        return false;
      }
      
      if (value < 20) {
        this.batteryWarning = 'Device battery is low';
      }
      
      return true;
    },
    
    validateAll() {
      this.validationErrors = [];
      this.validationWarnings = [];
      
      const validations = [
        this.validateDevice(),
        this.validateDate(),
        this.validateHP10(),
        this.validateHP007(),
        this.validateRate(),
        this.validateBattery()
      ];
      
      // Check for device assignment
      if (this.form.device_serial && !this.assignedPersonnel) {
        this.validationWarnings.push('Device is not assigned to any personnel');
      }
      
      return validations.every(v => v);
    },
    
    async saveDraft() {
      if (!this.isFormValid) {
        this.validateAll();
        return;
      }
      
      try {
        // Save to localStorage as draft
        const draft = {
          ...this.form,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          type: 'dose_reading'
        };
        
        const drafts = JSON.parse(localStorage.getItem('radiation_drafts_dose_reading') || '{}');
        drafts[draft.id] = draft;
        localStorage.setItem('radiation_drafts_dose_reading', JSON.stringify(drafts));
        
        this.successMessage = 'Draft saved successfully';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
        
      } catch (error) {
        console.error('Error saving draft:', error);
        this.$emit('error', 'Failed to save draft');
      }
    },
    
    async handleSubmit() {
      if (!this.validateAll()) {
        return;
      }
      
      this.submitting = true;
      this.successMessage = '';
      
      try {
        const formData = {
          device_serial: this.form.device_serial,
          measured_ts: this.form.measured_ts,
          hp10_mSv: this.form.hp10_mSv,
          hp007_mSv: this.form.hp007_mSv || null,
          rate_uSv_h: this.form.rate_uSv_h || null,
          battery_pct: this.form.battery_pct || null,
          gateway_id: 'MANUAL_ENTRY',
          data_source: 'MANUAL',
          entered_by: this.currentUser,
          notes: this.form.notes || null,
          raw_json: JSON.stringify({
            form_version: '1.0',
            manual_entry: true,
            timestamp: new Date().toISOString()
          }),
          payload_sig: null,
          sig_alg: null
        };
        
        const response = await fetch('/api/radiation/ingest/readings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const result = await response.json();
          this.successMessage = `Reading submitted successfully! Reading ID: ${result.reading_id}`;
          
          // Emit success event
          this.$emit('saved', result);
          
          // Reset form after successful submission
          setTimeout(() => {
            this.resetForm();
            this.$emit('close');
          }, 2000);
          
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit reading');
        }
        
      } catch (error) {
        console.error('Error submitting reading:', error);
        this.$emit('error', error.message);
      } finally {
        this.submitting = false;
      }
    },
    
    resetForm() {
      this.form = {
        device_serial: '',
        measured_ts: '',
        hp10_mSv: '',
        hp007_mSv: '',
        rate_uSv_h: '',
        battery_pct: '',
        notes: '',
        entered_by: this.currentUser,
        data_source: 'MANUAL'
      };
      
      // Reset validation states
      this.validationErrors = [];
      this.validationWarnings = [];
      this.deviceError = '';
      this.dateError = '';
      this.hp10Error = '';
      this.hp007Error = '';
      this.rateError = '';
      this.batteryWarning = '';
      this.hp10Warning = '';
      this.successMessage = '';
      
      // Set default timestamp
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      this.form.measured_ts = now.toISOString().slice(0, 16);
    }
  }
}
</script>

<style scoped>
.manual-dose-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1rem;
}

.validation-errors {
  animation: slideIn 0.3s ease-out;
}

.validation-warnings {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar for select elements */
select::-webkit-scrollbar {
  width: 8px;
}

select::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 4px;
}

select::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

select::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
