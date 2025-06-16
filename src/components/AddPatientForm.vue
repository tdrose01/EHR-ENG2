<template>
  <form @submit.prevent="handleSubmit" class="grid grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-bold mb-1">First Name</label>
      <input type="text" v-model="form.first_name" required class="w-full px-3 py-2 border rounded" />
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">Last Name</label>
      <input type="text" v-model="form.last_name" required class="w-full px-3 py-2 border rounded" />
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">Gender</label>
      <select v-model="form.gender" class="w-full px-3 py-2 border rounded">
        <option value="">Select</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">Marital Status</label>
      <select v-model="form.marital_status" class="w-full px-3 py-2 border rounded">
        <option value="">Select</option>
        <option value="Single">Single</option>
        <option value="Married">Married</option>
        <option value="Divorced">Divorced</option>
        <option value="Widowed">Widowed</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">Blood Type</label>
      <select v-model="form.blood_type" class="w-full px-3 py-2 border rounded">
        <option value="A+">A+</option>
        <option value="A-">A-</option>
        <option value="B+">B+</option>
        <option value="B-">B-</option>
        <option value="AB+">AB+</option>
        <option value="AB-">AB-</option>
        <option value="O+">O+</option>
        <option value="O-">O-</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">RH Factor</label>
      <select v-model="form.rh_factor" class="w-full px-3 py-2 border rounded">
        <option value="">Select</option>
        <option value="Positive">Positive</option>
        <option value="Negative">Negative</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">Duty Status</label>
      <select v-model="form.duty_status" class="w-full px-3 py-2 border rounded">
        <option value="">Select</option>
        <option value="Active">Active</option>
        <option value="Reserve">Reserve</option>
        <option value="Retired">Retired</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">Paygrade</label>
      <select v-model="form.paygrade" class="w-full px-3 py-2 border rounded">
        <option value="E1">E1</option>
        <option value="E2">E2</option>
        <option value="E3">E3</option>
        <option value="O1">O1</option>
        <option value="O2">O2</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">Branch of Service</label>
      <select v-model="form.branch_of_service" class="w-full px-3 py-2 border rounded">
        <option value="">Select</option>
        <option value="Army">Army</option>
        <option value="Navy">Navy</option>
        <option value="Air Force">Air Force</option>
        <option value="Marines">Marines</option>
        <option value="Coast Guard">Coast Guard</option>
        <option value="Space Force">Space Force</option>
        lue="Coast Guard">Coast Guard</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">PID</label>
      <input type="text" v-model="form.pid" class="w-full px-3 py-2 border rounded" />
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">DoD ID</label>
      <input type="number" v-model.number="form.dod_id" class="w-full px-3 py-2 border rounded" />
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">Ethnicity</label>
      <input type="text" v-model="form.ethnicity" class="w-full px-3 py-2 border rounded" />
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">Religion</label>
      <input type="text" v-model="form.religion" class="w-full px-3 py-2 border rounded" />
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">Date of Birth</label>
      <input type="date" v-model="form.date_of_birth" required class="w-full px-3 py-2 border rounded" />
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">Phone Number</label>
      <input type="tel" v-model="form.phone_number" class="w-full px-3 py-2 border rounded" />
    </div>
    <div class="col-span-2 flex justify-end mt-4">
      <button type="button" @click="$emit('cancel')" class="px-4 py-2 bg-gray-200 rounded mr-2">Cancel</button>
      <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">
        {{ patient ? 'Update' : 'Add' }}
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'AddPatientForm',
  props: {
    patient: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        first_name: '',
        last_name: '',
        gender: '',
        marital_status: '',
        blood_type: '',
        rh_factor: '',
        duty_status: '',
        pid: '',
        paygrade: '',
        branch_of_service: '',
        ethnicity: '',
        religion: '',
        dod_id: null,
        date_of_birth: '',
        phone_number: '',
        is_active: true
      }
    }
  },
  watch: {
    patient: {
      immediate: true,
      handler(value) {
        if (value) {
          this.form = { ...value }
        }
      }
    }
  },
  methods: {
    async handleSubmit() {
      try {
        const url = this.patient && this.patient.id
          ? `/api/patients/${this.patient.id}`
          : '/api/patients'
        const method = this.patient && this.patient.id ? 'PUT' : 'POST'
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        })
        if (res.ok) {
          this.$emit('saved')
        } else {
          console.error('Error saving patient', await res.text())
        }
      } catch (err) {
        console.error('Error saving patient', err)
      }
    }
  }
}
</script>
