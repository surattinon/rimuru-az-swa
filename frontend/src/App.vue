<script setup lang="ts">
import { ref } from 'vue';

// 1. Reactive state for our form fields
const formData = ref({
  name: '',
  email: '',
  message: ''
});

const statusMessage = ref('');
const isSubmitting = ref(false);

// 2. The function to send data to our Backend API
const submitForm = async () => {
  isSubmitting.value = true;
  statusMessage.value = 'Sending...';

  try {
    const response = await fetch('/api/SubmitForm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    });

    if (response.ok) {
      statusMessage.value = 'Success! Your data is in Cosmos DB.';
      // Reset form
      formData.value = { name: '', email: '', message: '' };
    } else {
      const err = await response.json();
      statusMessage.value = `Error: ${err.error || 'Submission failed'}`;
    }
  } catch (error) {
    statusMessage.value = 'System Error: Could not reach the API.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="form-container">
    <h1>Azure Landing Zone - Contact Form</h1>
    <p>Architecture: Vue + TypeScript + Azure Functions + Cosmos DB</p>
    
    <form @submit.prevent="submitForm">
      <input v-model="formData.name" placeholder="Full Name" required />
      <input v-model="formData.email" type="email" placeholder="Email Address" required />
      <textarea v-model="formData.message" placeholder="Your Message" required></textarea>
      
      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Processing...' : 'Submit to Azure' }}
      </button>
    </form>

    <p v-if="statusMessage" class="status">{{ statusMessage }}</p>
  </div>
</template>

<style scoped>
/* Simple CSS to make it look professional */
.form-container { max-width: 400px; margin: 50px auto; font-family: sans-serif; }
form { display: flex; flex-direction: column; gap: 15px; }
input, textarea { padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 10px; background-color: #0078d4; color: white; border: none; border-radius: 4px; cursor: pointer; }
button:disabled { background-color: #ccc; }
.status { margin-top: 20px; font-weight: bold; color: #0078d4; }
</style>
