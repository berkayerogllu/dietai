import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithCustomToken
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  onSnapshot,
  addDoc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';

// This section contains general CSS styles to be used throughout the application.
// In a typical React project, these styles would be in a separate CSS file (e.g., App.css or index.css).
const appStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  body {
    font-family: 'Inter', sans-serif;
  }

  .min-h-screen { min-height: 100vh; }
  .bg-gradient-br {
    background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
    --tw-gradient-from: #d1fae5; /* green-100 */
    --tw-gradient-to: rgba(209, 250, 229, 0);
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
  }
  .via-white { --tw-gradient-stops: var(--tw-gradient-from), #ffffff, var(--tw-gradient-to); }
  .to-green-50 { --tw-gradient-to: #f0fdf4; } /* green-50 */
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .p-4 { padding: 1rem; }
  .font-inter { font-family: 'Inter', sans-serif; }

  .bg-white { background-color: #ffffff; }
  .p-8 { padding: 2rem; }
  .rounded-2xl { border-radius: 1rem; }
  .shadow-xl { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); } /* Adjusted shadow for less prominence */
  .w-full { width: 100%; }
  .max-w-2xl { max-width: 42rem; } /* 672px */
  .max-w-sm { max-width: 24rem; /* 384px */ }
  .transform { transform: var(--tw-transform); }
  .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
  .duration-300 { transition-duration: 300ms; }

  .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .font-extrabold { font-weight: 800; }
  .text-green-800 { color: #166534; }
  .tracking-tight { letter-spacing: -0.025em; }
  .mb-4 { margin-bottom: 1rem; }
  .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .text-center { text-align: center; }
  .text-gray-500 { color: #6b7280; }
  .mb-8 { margin-bottom: 2rem; }
  
  /* Custom CSS for header buttons positioning */
  .header-container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem; /* Adjust as needed */
  }

  .header-button-group {
      display: flex;
      z-index: 10; /* Ensure buttons are on top */
      position: absolute; /* Position relative to .header-container */
      top: 0;
      right: 0;
  }
  .header-button-group > *:not(:first-child) {
      margin-left: 1rem; /* Space between buttons */
  }

  /* Buttons */
  .btn-green {
    background-color: #22c55e; /* green-500 */
    color: #ffffff;
    font-weight: 700;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    font-size: 0.875rem;
    border: 1px solid #d1d5db; /* Added border */
  }
  .btn-green:hover { background-color: #16a34a; } /* green-600 */

  .btn-red {
    background-color: #ef4444; /* red-500 */
    color: #ffffff;
    font-weight: 700;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    font-size: 0.875rem;
    border: 1px solid #d1d5db; /* Added border */
  }
  .btn-red:hover { background-color: #dc2626; } /* red-600 */

  /* Reduced padding and font-size for primary/secondary/orange buttons */
  .btn-primary {
    background-color: #22c55e; /* green-600 */
    color: #ffffff;
    font-weight: 700;
    padding: 0.6rem 1.25rem; /* Reduced from 0.75rem 1.5rem */
    border-radius: 0.75rem;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
    transform: var(--tw-transform);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #d1d5db; /* Added border */
    font-size: 0.9rem; /* Reduced font size */
  }
  .btn-primary:hover { background-color: #16a34a; transform: scale(1.05); } /* green-700 */
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-secondary {
    background-color: #6366f1; /* indigo-600 */
    color: #ffffff;
    font-weight: 700;
    padding: 0.6rem 1.25rem; /* Reduced from 0.75rem 1.5rem */
    border-radius: 0.75rem;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
    transform: var(--tw-transform);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #d1d5db; /* Added border */
    font-size: 0.9rem; /* Reduced font size */
  }
  .btn-secondary:hover { background-color: #4f46e5; transform: scale(1.05); } /* indigo-700 */
  .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-orange {
    background-color: #f97316; /* orange-500 */
    color: #ffffff;
    font-weight: 700;
    padding: 0.6rem 1.25rem; /* Reduced from 0.75rem 1.5rem */
    border-radius: 0.75rem;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
    transform: var(--tw-transform);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #d1d5db; /* Added border */
    font-size: 0.9rem; /* Reduced font size */
  }
  .btn-orange:hover { background-color: #ea580c; transform: scale(1.05); } /* orange-600 */
  .btn-orange:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-gray-200 {
    background-color: #e5e7eb; /* gray-200 */
    color: #374151; /* gray-800 */
    font-weight: 700;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid #d1d5db; /* Added border */
  }
  .btn-gray-200:hover { background-color: #d1d5db; } /* gray-300 */


  /* Utility classes */
  .space-y-6 > *:not(:first-child) { margin-top: 1.5rem; }
  .space-y-4 > *:not(:first-child) { margin-top: 1rem; }
  .space-y-1 > *:not(:first-child) { margin-top: 0.25rem; }
  .mb-6 { margin-bottom: 1.5rem; }
  .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .text-gray-700 { color: #374151; }
  .block { display: block; }
  .text-base { font-size: 1rem; line-height: 1.5rem; }
  .font-semibold { font-weight: 600; }
  .mb-2 { margin-bottom: 0.5rem; }
  .w-full { width: 100%; }
  .p-3 { padding: 0.75rem; }
  .border { border-width: 1px; }
  .border-gray-300 { border-color: #d1d5db; }
  .rounded-lg { border-radius: 0.5rem; }
  .focus\\:ring-green-500:focus { --tw-ring-color: #22c55e; ring-width: 2px; }
  .focus\\:border-green-500:focus { border-color: #22c55e; }
  .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
  .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
  .relative { position: relative; }
  .mb-6 { margin-bottom: 1.5rem; }
  .bg-red-100 { background-color: #fee2e2; }
  .border-red-400 { border-color: #f87171; }
  .text-red-700 { color: #b91c1c; }
  .rounded-lg { border-radius: 0.5rem; }
  .sm\\:inline { display: inline; }
  .bg-green-100 { background-color: #dcfce7; }
  .border-green-400 { border-color: #4ade80; }
  .text-green-700 { color: #15803d; }
  .animate-spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .h-5 { height: 1.25rem; }
  .w-5 { width: 1.25rem; }
  .mr-3 { margin-right: 0.75rem; }
  .text-white { color: #ffffff; }
  .block { display: block; }
  .sm\\:inline { display: inline; }
  .text-center { text-align: center; }
  .font-semibold { font-weight: 600; }
  .h-full { height: 100%; }
  .items-center { align-items: center; }
  .form-radio { appearance: none; border-radius: 9999px; border-width: 1px; border-color: #4a4a4a; width: 1.25rem; height: 1.25rem; background-color: #ffffff; flex-shrink: 0;} /* Dark grey border for unselected */
  .form-radio:checked { background-color: #22c55e; border-color: #16a34a; }
  .form-radio:checked:after { 
    content: ''; 
    display: block; 
    border-radius: 9999px; 
    width: 0.5rem; 
    height: 0.5rem; 
    background-color: #ffffff; 
    transform: translate(50%, 50%); 
    border: 1px solid #4a4a4a; /* Added 1px dark grey border for the inner dot */
  }
  .ml-2 { margin-left: 0.5rem; }
  .text-gray-800 { color: #1f2937; }
  .text-base { font-size: 1rem; line-height: 1.5rem; }
  .md\\:col-span-2 { grid-column: span 2 / span 2; }
  .bg-white { background-color: #ffffff; }
  .text-base { font-size: 1rem; line-height: 1.5rem; }
  .grid { display: grid; }
  .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .md\\:grid-cols-2 { @media (min-width: 768px) { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  .gap-8 { gap: 2rem; } /* Changed from gap-6 to gap-8 */
  .mt-6 { margin-top: 1.5rem; }
  .pt-8 { padding-top: 2rem; }
  /* Removed border-t-2 border-green-200 */
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sm\\:grid-cols-3 { @media (min-width: 640px) { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  .gap-3 { gap: 0.75rem; }
  .h-5 { height: 1.25rem; }
  .w-5 { width: 1.25rem; }
  .rounded-md { border-radius: 0.375rem; }
  .focus\\:ring-green-500:focus { --tw-ring-color: #22c55e; ring-width: 2px; }
  .cursor-pointer { cursor: pointer; }
  .mt-4 { margin-top: 1rem; }
  .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .italic { font-style: italic; }
  .mb-4 { margin-bottom: 1rem; }
  .space-y-4 > *:not(:first-child) { margin-top: 1rem; }
  .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .font-semibold { font-weight: 600; }
  .text-gray-900 { color: #111827; }
  .mb-1 { margin-bottom: 0.25rem; }
  .text-xs { font-size: 0.75rem; line-height: 1rem; }
  .font-bold { font-weight: 700; }
  .relative { position: relative; }
  .absolute { position: absolute; }
  .top-2 { top: 0.5rem; }
  .right-2 { right: 0.5rem; }
  .p-1 { padding: 0.25rem; }
  .rounded-full { border-radius: 9999px; }
  .text-xs { font-size: 0.75rem; line-height: 1rem; }
  .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
  .h-4 { height: 1rem; }
  .w-4 { width: 1rem; }
  .text-white { color: #ffffff; }
  .fixed { position: fixed; }
  .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
  .bg-black-opacity-50 { background-color: rgba(0, 0, 0, 0.5); } /* Custom class for auth modal overlay */
  .max-w-lg { max-width: 32rem; } /* 512px */
  .max-h-90vh { max-height: 90vh; }
  .overflow-y-auto { overflow-y: auto; }
  .scale-100 { transform: scale(1); }
  .opacity-100 { opacity: 1; }
  .text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .list-disc { list-style-type: disc; }
  .list-decimal { list-style-type: decimal; }
  .list-inside { list-style-position: inside; }
  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-6 { margin-top: 1.5rem; }
  .w-full { width: 100%; }
  .bg-gray-300 { background-color: #d1d5db; }
  .hover\\:bg-gray-400:hover { background-color: #9ca3af; }
  .text-gray-800 { color: #1f2937; }
  .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
  .px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
  .flex-wrap { flex-wrap: wrap; }
  .gap-4 { gap: 1rem; }
  .capitalize { text-transform: capitalize; }
  .flex-none { flex: none; }
  .min-w-320px { min-width: 320px; }
  .md\\:min-w-400px { @media (min-width: 768px) { min-width: 400px; } }
  .lg\\:min-w-450px { @media (min-width: 1024px) { min-width: 450px; } }
  .overflow-x-auto { overflow-x: auto; }
  .pb-4 { padding-bottom: 1rem; }
  .-mx-4 { margin-left: -1rem; margin-right: -1rem; }
  .px-4 { padding-left: 1rem; padding-right: 1rem; }
  .rounded-xl { border-radius: 0.75rem; }
  .border-green-200 { border-color: #a7f3d0; }
  .bg-green-50 { background-color: #f0fdf4; }
  .whitespace-nowrap { white-space: nowrap; }
  .hover\\:bg-gray-300:hover { background-color: #d1d5db; }
  .selected-day { background-color: #22c55e; color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
  .default-day { background-color: #e5e7eb; color: #374151; }
  .default-day:hover { background-color: #d1d5db; }
  .focus\\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }

  .meal-plan-card {
    display: block;
    padding: 1rem; /* p-4 */
    border-radius: 0.5rem; /* rounded-lg */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
    text-align: left;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
    background-color: #f9fafb; /* bg-gray-50 */
    border-width: 2px; /* border-2 */
    border-color: #e5e7eb; /* border-gray-200 */
    position: relative;
  }
  .meal-plan-card:hover {
    background-color: #f3f4f6; /* hover:bg-gray-100 */
  }
  .meal-plan-card-selected {
    background-color: #dcfce7; /* bg-green-200 */
    border-color: #22c55e; /* border-green-500 */
  }

  .meal-plan-delete-btn {
    position: absolute;
    top: 0.5rem; /* top-2 */
    right: 0.5rem; /* right-2 */
    background-color: #ef4444; /* red-500 */
    color: #ffffff;
    padding: 0.25rem; /* p-1 */
    border-radius: 9999px; /* rounded-full */
    font-size: 0.75rem; /* text-xs */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
  }
  .meal-plan-delete-btn:hover {
    background-color: #dc2626; /* hover:bg-red-600 */
  }
  .meal-plan-delete-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-red-confirm {
      background-color: #dc2626; /* red-600 */
      color: #ffffff;
      font-weight: 700;
      padding: 0.5rem 1.25rem; /* py-2 px-5 */
      border-radius: 0.75rem; /* rounded-xl */
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 300ms;
      transform: var(--tw-transform);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #d1d5db; /* Added border */
  }
  .btn-red-confirm:hover { background-color: #b91c1c; transform: scale(1.05); } /* red-700 */
  .btn-red-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-gray-cancel {
      background-color: #d1d5db; /* gray-300 */
      color: #1f2937; /* gray-800 */
      font-weight: 700;
      padding: 0.5rem 1.25rem; /* py-2 px-5 */
      border-radius: 0.75rem; /* rounded-xl */
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 300ms;
      transform: var(--tw-transform);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #d1d5db; /* Added border */
  }
  .btn-gray-cancel:hover { background-color: #9ca3af; transform: scale(1.05); } /* gray-400 */
  .btn-gray-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Removed background-color and box-shadow from here, applying them conditionally in JSX */
  .radio-option-label {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem; /* py-2 px-4 - Changed from 0.75rem 1.25rem */
    border-width: 1px;
    border-color: #d1d5db; /* gray-300 */
    border-radius: 0.5rem; /* rounded-lg */
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }
  .radio-option-label input[type="radio"]:checked + span {
    /* Removed text color change here, text color will be set on the parent label */
  }
  
  /* Custom CSS for gender radio buttons spacing */
  .gender-options-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem; /* Space between items in a column */
      width: 100%; /* Ensure it takes full width for mx-auto to work */
      margin-left: auto; /* mx-auto */
      margin-right: auto; /* mx-auto */
      max-width: 12rem; /* Adjusted for better appearance based on image */
  }

  @media (min-width: 640px) { /* Small screens and up */
      .gender-options-group {
          flex-direction: row; /* Layout in a row */
          gap: 0.5rem; /* Space between items in a row */
          justify-content: center; /* Center items in a row */
      }
  }

  /* Specific styles for gender radio buttons */
  .gender-option-male-selected {
    background-color: #3b82f6; /* blue-500 */
    color: #ffffff; /* text-white */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
  }
  .gender-option-male-selected:hover {
    background-color: #2563eb; /* blue-600 */
    color: #ffffff;
  }

  .gender-option-female-selected {
    background-color: #ec4899; /* pink-500 */
    color: #ffffff; /* text-white */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
  }
  .gender-option-female-selected:hover {
    background-color: #db2777; /* pink-600 */
    color: #ffffff;
  }

  .gender-option-default {
    background-color: #ffffff; /* bg-white */
    color: #1f2937; /* text-gray-800 */
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
    border: 2px solid #000000; /* Changed border to 2px black */
  }
  .gender-option-default:hover {
    background-color: #f3f4f6; /* hover:bg-gray-100 */
  }

  /* Specific styles for weight goal radio buttons */
  .weight-goal-option-selected {
    background-color: #22c55e; /* green-500 */
    color: #ffffff;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-color: #22c55e; /* Ensure border color matches */
  }
  .weight-goal-option-selected:hover {
    background-color: #16a34a; /* green-600 */
  }

  .weight-goal-option-default {
    background-color: #ffffff; /* bg-white */
    color: #1f2937; /* text-gray-800 */
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
    border: 2px solid #000000; /* Changed border to 2px black */
  }
  .weight-goal-option-default:hover {
    background-color: #f3f4f6; /* hover:bg-gray-100 */
  }

  /* Custom class for 10px gap between weight goal buttons */
  .gap-weight-goal {
      gap: 10px;
  }

  /* Custom styles for auth page switch buttons */
  .auth-switch-button {
    background-color: transparent;
    color: #22c55e; /* green-600 */
    font-weight: 600;
    padding: 0.25rem 0.5rem; /* py-1 px-2 */
    border-radius: 0.375rem; /* rounded-md */
    transition: all 0.2s ease-in-out;
    box-shadow: none;
    border: none;
    text-decoration: underline; /* Added underline for better visibility */
  }
  .auth-switch-button:hover {
    color: #16a34a; /* green-800 */
    background-color: #dcfce7; /* green-100 */
    text-decoration: none;
  }
`;

// AuthPage Component: Manages Login and Registration Processes
function AuthPage({ auth, setErrorMessage, setSuccessMessage, onAuthSuccess, initialMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');
  const [authLoading, setAuthLoading] = useState(false);
  const [localErrorMessage, setLocalErrorMessage] = useState('');

  const handleAuth = async () => {
    setLocalErrorMessage('');
    setSuccessMessage('');
    setAuthLoading(true);
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setSuccessMessage('Başarıyla giriş yapıldı!');
      onAuthSuccess();
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        setLocalErrorMessage('Geçersiz e-posta adresi.');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setLocalErrorMessage('Böyle bir hesap bulunamamıştır. Lütfen girdiğiniz bilgilerin doğruluğundan emin olunuz ya da kayıt olunuz.');
      } else if (error.code === 'auth/email-already-in-use') {
        setLocalErrorMessage('Bu e-posta adresi zaten kullanılıyor.');
      } else if (error.code === 'auth/weak-password') {
        setLocalErrorMessage('Şifre çok zayıf. En az 6 karakter olmalı.');
      } else {
        setLocalErrorMessage('Kimlik doğrulama hatası: ' + error.message);
      }
      console.error("Auth error:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <h2 className="text-3xl font-extrabold text-center text-green-800 mb-6">
        {isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}
      </h2>
      {localErrorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm">
          <span className="block sm:inline">{localErrorMessage}</span>
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-2">
          E-posta
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-2">
          Şifre
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifreniz (min. 6 karakter)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
        />
      </div>
      <button
        onClick={handleAuth}
        className="w-full btn-primary"
        disabled={authLoading || !email || !password || password.length < 6}
      >
        {authLoading ? (
          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'
        )}
      </button>
      <p className="text-center text-gray-700">
        {isLoginMode ? "Hesabınız yok mu?" : "Zaten bir hesabınız var mı?"}{' '}
        <button
          onClick={() => setIsLoginMode(!isLoginMode)}
          className="auth-switch-button" // New class for improved styling
        >
          {isLoginMode ? 'Kayıt Ol' : 'Giriş Yap'}
        </button>
      </p>
    </div>
  );
}

// RecipeModal Component: Displays the recipe in a modal window
function RecipeModal({ recipe, onClose, loading, error }) {
  return (
    <div className="fixed inset-0 bg-black-opacity-50 flex items-center justify-center p-4"> {/* Changed to custom class */}
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg max-h-90vh overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
        <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">Yemek Tarifi</h3>
        {loading && (
          <div className="text-center text-gray-600">
            <svg className="animate-spin h-8 w-8 mx-auto text-green-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2">Tarif yükleniyor...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}
        {recipe && !loading && !error && (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-gray-900">{recipe.name}</h4>
            <div className="text-gray-700">
              <p className="font-bold">Malzemeler:</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                {recipe.ingredients.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="text-gray-700">
              <p className="font-bold">Hazırlanışı:</p>
              <ol className="list-decimal list-inside space-y-1 mt-1">
                {recipe.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-6 w-full btn-red"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}

// ConfirmationModal Component: A modal window asking for user confirmation
function ConfirmationModal({ message, onConfirm, onCancel, show, loading }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black-opacity-50 flex items-center justify-center p-4"> /* Changed to custom class */
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <p className="text-lg font-semibold text-gray-800 mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className="btn-red-confirm"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Evet'}
          </button>
          <button
            onClick={onCancel}
            className="btn-gray-cancel"
            disabled={loading}
          >
            Hayır
          </button>
        </div>
      </div>
    </div>
  );
}


// NutritionAIAppContent Component: Displays the main application content
function NutritionAIAppContent({ db, currentUser, isAuthReady, setErrorMessage, setSuccessMessage, handleLogout, triggerLoginPrompt, pendingMealPlanToSave, setPendingMealPlanToSave, appId }) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [weightGoal, setWeightGoal] = useState('');

  const [calculatedCalories, setCalculatedCalories] = useState(0);
  const [mealCount, setMealCount] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [otherAllergen, setOtherAllergen] = useState('');
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showProfile, setShowProfile] = useState(false);

  const [savedMealPlans, setSavedMealPlans] = useState([]);
  const [selectedSavedPlanId, setSelectedSavedPlanId] = useState(null);

  const [editInstruction, setEditInstruction] = useState('');

  const currentUserId = currentUser?.uid;

  const [currentMealPlanDocId, setCurrentMealPlanDocId] = useState(null);

  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState('');

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [planToDeleteId, setPlanToDeleteId] = useState(null);

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);


  const allAllergens = [
    'Gluten', 'Süt Ürünleri', 'Fındık', 'Soya', 'Yumurta',
    'Kabuklu Deniz Ürünleri', 'Yer Fıstığı', 'Balık', 'Hardal',
  ];

  useEffect(() => {
    if (!db || !isAuthReady || !currentUserId) {
      setWeight(''); setHeight(''); setAge(''); setGender(''); setActivityLevel('');
      setSelectedAllergens([]);
      setOtherAllergen('');
      setWeightGoal('');
      return;
    }

    const userProfileDocRef = doc(db, `users/${currentUserId}/profile`, 'userProfileDoc');

    const fetchUserProfile = async () => {
      try {
        const docSnap = await getDoc(userProfileDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setWeight(data.weight ? data.weight.toString() : '');
          setHeight(data.height ? data.height.toString() : '');
          setAge(data.age ? data.age.toString() : '');
          setGender(data.gender || '');
          setActivityLevel(data.activityLevel || '');
          setSelectedAllergens(data.selectedAllergens || []);
          setOtherAllergen(data.otherAllergen || '');
          setWeightGoal(data.weightGoal || '');
        }
      } catch (error) {
        console.error("Kullanıcı profili yüklenirken hata:", error);
        setErrorMessage("Profil bilgileri yüklenemedi: " + error.message);
      }
    };
    fetchUserProfile();
  }, [db, isAuthReady, currentUserId, setErrorMessage]);

  const handleAllergenChange = (allergen) => {
    if (selectedAllergens.includes(allergen)) {
      setSelectedAllergens(selectedAllergens.filter((item) => item !== allergen));
    } else {
      setSelectedAllergens([...selectedAllergens, allergen]);
    }
  };

  const calculateDailyCalories = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);

    if (isNaN(w) || isNaN(h) || isNaN(a) || !gender || !activityLevel || !weightGoal) {
      setCalculatedCalories(0);
      return;
    }

    let bmr;
    if (gender === 'male') {
      bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
      bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
    }

    let tdee;
    switch (activityLevel) {
      case 'sedentary':
        tdee = bmr * 1.2;
        break;
      case 'lightly_active':
        tdee = bmr * 1.375;
        break;
      case 'moderately_active':
        tdee = bmr * 1.55;
        break;
      case 'very_active':
        tdee = bmr * 1.725;
        break;
      case 'extra_active':
        tdee = bmr * 1.9;
        break;
      default:
        tdee = bmr;
    }

    let adjustedCalories = tdee;

    if (weightGoal === 'lose') {
      adjustedCalories = tdee - 500;
      if (gender === 'female' && adjustedCalories < 1200) adjustedCalories = 1200;
      if (gender === 'male' && adjustedCalories < 1500) adjustedCalories = 1500;
    } else if (weightGoal === 'gain') {
      adjustedCalories = tdee + 300;
    }

    setCalculatedCalories(Math.round(adjustedCalories));
  };

  useEffect(() => {
    calculateDailyCalories();
  }, [weight, height, age, gender, activityLevel, weightGoal]);

  const generateMealPlan = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!weight || !height || !age || !gender || !activityLevel || !mealCount || !weightGoal) {
      setErrorMessage('Lütfen tüm kişisel bilgilerinizi (kilo, boy, yaş, cinsiyet, aktivite, kilo hedefi) ve öğün sayısını girin.');
      return;
    }
    if (calculatedCalories <= 0) {
      setErrorMessage('Günlük kalori ihtiyacınız hesaplanamadı. Lütfen geçerli değerler girin.');
      return;
    }

    setLoading(true);
    setMealPlan(null);
    setCurrentMealPlanDocId(null);
    setSelectedDayIndex(0);

    try {
      let prompt = `Haftalık bir yemek planı oluştur. Günlük kalori limiti: ${calculatedCalories} kcal, Öğün sayısı: ${mealCount}. `;

      let goalText = "";
      if (weightGoal === 'lose') {
        goalText = "Ana hedef kilo vermek.";
      } else if (weightGoal === 'gain') {
        goalText = "Ana hedef kilo almak.";
      } else if (weightGoal === 'maintain') {
        goalText = "Ana hedef mevcut kiloyu korumak.";
      }
      prompt += goalText + " ";

      let allergenPrompt = selectedAllergens.length > 0
        ? `Şu alerjenleri içermesin: ${selectedAllergens.join(', ')}.`
        : '';
      const otherAllergenText = otherAllergen.trim() ? `Ayrıca şu alerjenleri içermesin: ${otherAllergen.trim()}.` : '';
      prompt += allergenPrompt + " " + otherAllergenText + " JSON formatında, her gün için kahvaltı, öğle yemeği, akşam yemeği ve ara öğünleri (eğer öğün sayısı fazlaysa) içeren bir yapı oluştur. Her öğün için isim, açıklama, toplam kalori, karbonhidrat, protein ve yağ değerlerini belirt. Ayrıca her gün için kısa ve ilham verici bir motivasyon cümlesi ekle.";

      const payload = {
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                "day": { "type": "STRING" },
                "motivationQuote": { "type": "STRING" },
                "meals": {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      "name": { "type": "STRING" },
                      "description": { "type": "STRING" },
                      "calories": { "type": "NUMBER" },
                      "carbohydrates": { "type": "NUMBER" },
                      "protein": { "type": "NUMBER" },
                      "fat": { "type": "NUMBER" }
                    },
                    propertyOrdering: ["name", "description", "calories", "carbohydrates", "protein", "fat"]
                  }
                }
              },
              propertyOrdering: ["day", "motivationQuote", "meals"]
            }
          }
        }
      };

      const apiKey = "AIzaSyDOxq2zKAAQAY0XM75QYXuYuwp-ipv2n_4"; // Gemini API Key
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const jsonText = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(jsonText);
        setMealPlan(parsedJson);
        setSuccessMessage('Yemek planı başarıyla oluşturuldu!');
        setSelectedDayIndex(0);
      } else {
        setErrorMessage('Yemek planı oluşturulamadı. Lütfen farklı bir deneme yapın.');
        console.error('API yanıt yapısı beklenenden farklı:', result);
      }
    } catch (error) {
      setErrorMessage('Bir hata oluştu: ' + error.message);
      console.error('Yemek planı oluşturulurken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentMealPlan = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentUser) {
      setPendingMealPlanToSave({
        calculatedCalories,
        mealCount: parseInt(mealCount),
        selectedAllergens,
        otherAllergen: otherAllergen.trim(),
        mealPlan: JSON.stringify(mealPlan),
        timestamp: new Date().toISOString(),
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: parseInt(age),
        gender,
        activityLevel,
        weightGoal
      });
      triggerLoginPrompt();
      setErrorMessage('Planı kaydetmek için lütfen giriş yapın veya kayıt olun.');
      return;
    }

    if (!mealPlan) {
      setErrorMessage('Kaydedilecek bir yemek planı yok.');
      return;
    }

    const dataToSave = {
      calculatedCalories,
      mealCount: parseInt(mealCount),
      selectedAllergens,
      otherAllergen: otherAllergen.trim(),
      mealPlan: JSON.stringify(mealPlan),
      timestamp: new Date().toISOString(),
      weight: parseFloat(weight),
      height: parseFloat(height),
      age: parseInt(age),
      gender,
      activityLevel,
      weightGoal
    };

    setLoading(true);
    try {
      const mealPlansCollectionRef = collection(db, `users/${currentUser.uid}/mealPlans`);
      let docRefToUse;

      if (currentMealPlanDocId) {
        docRefToUse = doc(db, `users/${currentUser.uid}/mealPlans`, currentMealPlanDocId);
        await setDoc(docRefToUse, dataToSave, { merge: true });
        setSuccessMessage('Yemek planı başarıyla güncellendi!');
      } else {
        docRefToUse = await addDoc(mealPlansCollectionRef, dataToSave);
        setCurrentMealPlanDocId(docRefToUse.id);
        setSuccessMessage('Yemek planı başarıyla kaydedildi!');
      }
    } catch (error) {
      setErrorMessage('Yemek planı kaydedilirken/güncellenirken hata oluştu: ' + error.message);
      console.error('Plan kaydetme/güncelleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!db || !isAuthReady || !currentUser?.uid || !showProfile) {
      setSavedMealPlans([]);
      return;
    }

    const mealPlansCollectionRef = collection(db, `users/${currentUser.uid}/mealPlans`);
    const q = query(mealPlansCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plans = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        plans.push({
          id: doc.id,
          ...data,
          mealPlan: JSON.parse(data.mealPlan)
        });
      });
      plans.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setSavedMealPlans(plans);
    }, (error) => {
      console.error("Kaydedilmiş planları çekerken hata:", error);
      setErrorMessage("Kaydedilmiş planlar yüklenemedi: " + error.message);
    });

    return () => unsubscribe();
  }, [db, isAuthReady, currentUser?.uid, showProfile, setErrorMessage]);

  useEffect(() => {
    if (db && currentUser && isAuthReady && pendingMealPlanToSave) {
      setLoading(true);
      const processPendingSave = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        try {
          const mealPlansCollectionRef = collection(db, `users/${currentUser.uid}/mealPlans`);
          const newDocRef = await addDoc(mealPlansCollectionRef, pendingMealPlanToSave);
          setCurrentMealPlanDocId(newDocRef.id);
          setSuccessMessage('Önceki planınız başarıyla hesabınıza kaydedildi!');
          setMealPlan(JSON.parse(pendingMealPlanToSave.mealPlan));
          setWeight(pendingMealPlanToSave.weight.toString());
          setHeight(pendingMealPlanToSave.height.toString());
          setAge(pendingMealPlanToSave.age.toString());
          setGender(pendingMealPlanToSave.gender);
          setActivityLevel(pendingMealPlanToSave.activityLevel);
          setMealCount(pendingMealPlanToSave.mealCount.toString());
          setSelectedAllergens(pendingMealPlanToSave.selectedAllergens || []);
          setOtherAllergen(pendingMealPlanToSave.otherAllergen || '');
          setWeightGoal(pendingMealPlanToSave.weightGoal || '');
          setSelectedDayIndex(0);
        } catch (error) {
          setErrorMessage('Bekleyen diyet planı kaydedilirken hata oluştu: ' + error.message);
          console.error('Pending plan save error after login:', error);
        } finally {
          setLoading(false);
          setPendingMealPlanToSave(null);
        }
      };
      processPendingSave();
    }
  }, [db, currentUser, isAuthReady, pendingMealPlanToSave, setPendingMealPlanToSave, setErrorMessage, setSuccessMessage, setMealPlan, setWeight, setHeight, setAge, setGender, setActivityLevel, setMealCount, setSelectedAllergens, setOtherAllergen, setWeightGoal]);

  const loadSavedPlan = (planId) => {
    const planToLoad = savedMealPlans.find(plan => plan.id === planId);
    if (planToLoad) {
      setWeight(planToLoad.weight.toString());
      setHeight(planToLoad.height.toString());
      setAge(planToLoad.age.toString());
      setGender(planToLoad.gender);
      setActivityLevel(planToLoad.activityLevel);
      setMealCount(planToLoad.mealCount.toString());
      setSelectedAllergens(planToLoad.selectedAllergens);
      setCalculatedCalories(planToLoad.calculatedCalories);
      setMealPlan(planToLoad.mealPlan);
      setCurrentMealPlanDocId(planId);
      setSelectedSavedPlanId(planId);
      setOtherAllergen(planToLoad.otherAllergen || '');
      setWeightGoal(planToLoad.weightGoal || '');
      setSuccessMessage('Kaydedilen plan yüklendi!');
      setErrorMessage('');
      setShowProfile(false);
      setSelectedDayIndex(0);
    } else {
      setErrorMessage('Yüklenecek plan bulunamadı.');
    }
  };

  const saveUserProfile = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentUser) {
      triggerLoginPrompt();
      setErrorMessage('Profil bilgilerinizi kaydetmek için giriş yapın veya kayıt olun.');
      return;
    }
    if (!weight || !height || !age || !gender || !activityLevel || !weightGoal) {
      setErrorMessage('Lütfen tüm profil bilgilerini doldurun.');
      return;
    }
    if (!db || !isAuthReady) {
      setErrorMessage('Veritabanı bağlantısı veya kullanıcı bilgileri hazır değil.');
      return;
    }

    try {
      const userProfileDocRef = doc(db, `users/${currentUser.uid}/profile`, 'userProfileDoc');
      await setDoc(userProfileDocRef, {
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: parseInt(age),
        gender,
        activityLevel,
        weightGoal,
        lastUpdated: new Date().toISOString(),
        selectedAllergens: selectedAllergens,
        otherAllergen: otherAllergen.trim(),
      }, { merge: true });
      setSuccessMessage('Profil bilgileri başarıyla kaydedildi!');
    } catch (error) {
      setErrorMessage('Profil bilgileri kaydedilirken hata oluştu: ' + error.message);
      console.error('Profil kaydetme hatası:', error);
    }
  };

  const handleDeleteClick = (planId) => {
    setPlanToDeleteId(planId);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentUser || !db || !isAuthReady || !planToDeleteId) {
      setErrorMessage('Planı silmek için giriş yapmalısınız veya silinecek plan bulunamadı.');
      setShowDeleteConfirmation(false);
      return;
    }

    setLoading(true);
    try {
      const mealPlanDocRef = doc(db, `users/${currentUser.uid}/mealPlans`, planToDeleteId);
      await deleteDoc(mealPlanDocRef);
      setSuccessMessage('Diyet planı başarıyla silindi!');
      if (currentMealPlanDocId === planToDeleteId) {
        setMealPlan(null);
        setCurrentMealPlanDocId(null);
        setSelectedSavedPlanId(null);
      }
    } catch (error) {
      setErrorMessage('Diyet planı silinirken hata oluştu: ' + error.message);
      console.error('Diyet planı silme hatası:', error);
    } finally {
      setLoading(false);
      setShowDeleteConfirmation(false);
      setPlanToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setPlanToDeleteId(null);
    setErrorMessage('');
  };

  const fetchRecipe = async (mealName, mealDescription) => {
    setRecipeLoading(true);
    setRecipeError('');
    setCurrentRecipe(null);
    setShowRecipeModal(true);

    try {
      let prompt = `Bana "${mealName}" yemeği için malzemeler ve yapılış talimatları ver. Eğer "${mealDescription}" bilgisi varsa bunu da dikkate al. Cevabı JSON formatında döndür. JSON yapısı şu şekilde olsun: {"name": "Yemek Adı", "ingredients": ["malzeme1", "malzeme2"], "instructions": ["adım1", "adım2"]}.`;

      const payload = {
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              "name": { "type": "STRING" },
              "ingredients": { "type": "ARRAY", "items": { "type": "STRING" } },
              "instructions": { "type": "ARRAY", "items": { "type": "STRING" } }
            },
            propertyOrdering: ["name", "ingredients", "instructions"]
          }
        }
      };

      const apiKey = "AIzaSyDOxq2zKAAQAY0XM75QYXuYuwp-ipv2n_4"; // Gemini API Key
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const jsonText = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(jsonText);
        setCurrentRecipe(parsedJson);
      } else {
        setRecipeError('Tarif bulunamadı veya geçersiz format.');
        console.error('API yanıt yapısı beklenenden farklı:', result);
      }
    } catch (error) {
      setRecipeError('Tarif çekilirken bir hata oluştu: ' + error.message);
      console.error('Recipe fetch error:', error);
    } finally {
      setRecipeLoading(false);
    }
  };


  const handleEditMealPlan = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    if (!mealPlan) {
      setErrorMessage('Düzenlenecek bir yemek planı yok. Lütfen önce bir plan oluşturun.');
      setLoading(false);
      return;
    }
    if (!editInstruction.trim()) {
      setErrorMessage('Lütfen düzenleme talimatını girin.');
      setLoading(false);
      return;
    }

    try {
      const currentPlanJson = JSON.stringify(mealPlan);
      let prompt = `Aşağıdaki haftalık yemek planını verilen talimata göre güncelle. Sadece belirtilen değişiklikleri yap ve planın diğer kısımlarını aynen koru. Eğer bir öğün kaldırılırsa, yerine başka bir öğün ekleyerek veya mevcut öğünlerin makro ve kalori değerlerini yeniden dengeleyerek genel günlük kalori ve makro hedeflerini koru. Güncel planı JSON formatında geri döndür. Her öğün için isim, açıklama, toplam kalori, karbonhidrat, protein ve yağ değerlerini belirt. Ayrıca her gün için kısa ve ilham verici bir motivasyon cümlesi ekle.
      Mevcut Plan: ${currentPlanJson}
      Talimat: ${editInstruction}`;

      const otherAllergenText = otherAllergen.trim() ? `Ek olarak, şu alerjenleri (varsa) dikkate al: ${otherAllergen.trim()}.` : '';
      prompt += otherAllergenText;

      const payload = {
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                "day": { "type": "STRING" },
                "motivationQuote": { "type": "STRING" },
                "meals": {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      "name": { "type": "STRING" },
                      "description": { "type": "STRING" },
                      "calories": { "type": "NUMBER" },
                      "carbohydrates": { "type": "NUMBER" },
                      "protein": { "type": "NUMBER" },
                      "fat": { "type": "NUMBER" }
                    },
                    propertyOrdering: ["name", "description", "calories", "carbohydrates", "protein", "fat"]
                  }
                }
              },
              propertyOrdering: ["day", "motivationQuote", "meals"]
            }
          }
        }
      };

      const apiKey = "AIzaSyDOxq2zKAAQAY0XM75QYXuYuwp-ipv2n_4"; // Gemini API Key
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const jsonText = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(jsonText);
        setMealPlan(parsedJson);
        setSuccessMessage('Yemek planı başarıyla güncellendi!');
        setEditInstruction('');
        if (currentUser) {
          await saveCurrentMealPlan();
        } else {
          setSuccessMessage('Yemek planı başarıyla güncellendi! Kaydetmek için lütfen giriş yapın.');
        }
      } else {
        setErrorMessage('Yemek planı güncellenemedi. Lütfen talimatı daha açık belirtin veya tekrar deneyin.');
        console.error('API yanıt yapısı beklenenden farklı veya içerik boş:', result);
      }
    } catch (error) {
      setErrorMessage('Bir hata oluştu: ' + error.message);
      console.error('Yemek planı güncellenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Main container now uses a wider max-width and no hover effect for better site-like appearance
    <div className="min-h-screen bg-gradient-br flex items-center justify-center p-4 font-inter">
      {/* Removed hover:scale-105 from this div */}
      <div className="bg-white p-8 pt-16 rounded-2xl shadow-xl w-full max-w-full relative transform transition-all duration-300"> {/* Added pt-16 for top padding */}
        {/* Header container for title and buttons */}
        <div className="header-container">
          <h1 className="text-4xl font-extrabold text-green-800 tracking-tight">
            NutritionAI
          </h1>
          {/* Buttons moved to top-right corner using absolute positioning */}
          <div className="header-button-group"> {/* Applied custom CSS class */}
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="btn-green"
            >
              {showProfile ? 'Ana Sayfa' : 'Profilim'}
            </button>
            <button
              onClick={handleLogout}
              className="btn-red"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
        <p className="text-sm text-center text-gray-500 mb-8">
          Kullanıcı ID: {currentUserId ? currentUserId : 'Giriş Yapılmadı'}
        </p>

        {showProfile ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Profil Bilgileriniz</h2>
            {/* Updated gap to gap-8 for increased spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="mx-auto w-full max-w-xs">
                <label htmlFor="profileWeight" className="block text-base font-semibold text-gray-700 mb-2">
                  Kilo (kg)
                </label>
                <input
                  type="number"
                  id="profileWeight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Örn: 70"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
                />
              </div>
              <div className="mx-auto w-full max-w-xs">
                <label htmlFor="profileHeight" className="block text-base font-semibold text-gray-700 mb-2">
                  Boy (cm)
                </label>
                <input
                  type="number"
                  id="profileHeight"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Örn: 175"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
                />
              </div>
              <div className="mx-auto w-full max-w-xs">
                <label htmlFor="profileAge" className="block text-base font-semibold text-gray-700 mb-2">
                  Yaş
                </label>
                <input
                  type="number"
                  id="profileAge"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Örn: 30"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
                />
              </div>
              <div className="mx-auto w-full max-w-xs">
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Cinsiyet
                </label>
                {/* Applied custom CSS class for gender options spacing */}
                <div className="gender-options-group">
                  <label className={`radio-option-label ${gender === 'male' ? 'gender-option-male-selected' : 'gender-option-default'}`}>
                    <input
                      type="radio"
                      className="form-radio"
                      name="profileGender"
                      value="male"
                      checked={gender === 'male'}
                      onChange={(e) => setGender(e.target.value)}
                    />
                    <span className="ml-2 text-base">Erkek</span>
                  </label>
                  <label className={`radio-option-label ${gender === 'female' ? 'gender-option-female-selected' : 'gender-option-default'}`}>
                    <input
                      type="radio"
                      className="form-radio"
                      name="profileGender"
                      value="female"
                      checked={gender === 'female'}
                      onChange={(e) => setGender(e.target.value)}
                    />
                    <span className="ml-2 text-base">Kadın</span>
                  </label>
                </div>
              </div>
              <div className="md:col-span-2 mx-auto w-full max-w-xs">
                <label htmlFor="profileActivityLevel" className="block text-base font-semibold text-gray-700 mb-2">
                  Aktivite Seviyesi
                </label>
                <select
                  id="profileActivityLevel"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200 bg-white text-base"
                >
                  <option value="">Seçiniz...</option>
                  <option value="sedentary">Sedanter (Çok az egzersiz)</option>
                  <option value="lightly_active">Hafif Aktif (Haftada 1-3 gün egzersiz)</option>
                  <option value="moderately_active">Orta Derece Aktif (Haftada 3-5 gün egzersiz)</option>
                  <option value="very_active">Çok Aktif (Haftada 6-7 gün egzersiz)</option>
                  <option value="extra_active">Ekstra Aktif (Çok yoğun egzersiz/fiziksel iş)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Kilo Hedefi
                </label>
                <div className="flex flex-wrap gap-weight-goal mt-1 justify-center md:justify-start"> {/* Applied custom gap class */}
                  <label className={`radio-option-label ${weightGoal === 'lose' ? 'weight-goal-option-selected' : 'weight-goal-option-default'}`}>
                    <input
                      type="radio"
                      className="form-radio"
                      name="weightGoal"
                      value="lose"
                      checked={weightGoal === 'lose'}
                      onChange={(e) => setWeightGoal(e.target.value)}
                    />
                    <span className="ml-2 text-base">Kilo Vermek</span>
                  </label>
                  <label className={`radio-option-label ${weightGoal === 'gain' ? 'weight-goal-option-selected' : 'weight-goal-option-default'}`}>
                    <input
                      type="radio"
                      className="form-radio"
                      name="weightGoal"
                      value="gain"
                      checked={weightGoal === 'gain'}
                      onChange={(e) => setWeightGoal(e.target.value)}
                    />
                    <span className="ml-2 text-base">Kilo Almak</span>
                  </label>
                  <label className={`radio-option-label ${weightGoal === 'maintain' ? 'weight-goal-option-selected' : 'weight-goal-option-default'}`}>
                    <input
                      type="radio"
                      className="form-radio"
                      name="weightGoal"
                      value="maintain"
                      checked={weightGoal === 'maintain'}
                      onChange={(e) => setWeightGoal(e.target.value)}
                    />
                    <span className="ml-2 text-base">Mevcut Kiloyu Korumak</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Alerjenler (İçermesin)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allAllergens.map((allergen) => (
                  <div key={allergen} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`profile-${allergen}`}
                      checked={selectedAllergens.includes(allergen)}
                      onChange={() => handleAllergenChange(allergen)}
                      className="h-5 w-5 text-green-600 rounded-md focus:ring-green-500 transition-all duration-200"
                    />
                    <label htmlFor={`profile-${allergen}`} className="ml-2 text-sm text-gray-800 cursor-pointer">
                      {allergen}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label htmlFor="profileOtherAllergen" className="block text-base font-semibold text-gray-700 mb-2">
                  Diğer Alerjenler (virgülle ayırarak girin)
                </label>
                <textarea
                  id="profileOtherAllergen"
                  value={otherAllergen}
                  onChange={(e) => setOtherAllergen(e.target.value)}
                  placeholder="Örn: Kivi, Tarçın, Gluten"
                  rows="2"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
                ></textarea>
              </div>
            </div>

            <button
              onClick={saveUserProfile}
              className="w-full btn-primary mt-6"
              disabled={!isAuthReady || !weight || !height || !age || !gender || !activityLevel || !weightGoal || !currentUser}
            >
              Profili Kaydet
            </button>

            {isAuthReady && currentUser && savedMealPlans.length > 0 && (
              <div className="mt-10 pt-8">
                <h2 className="text-xl font-extrabold text-center text-green-800 mb-6">
                  Kaydedilmiş Beslenme Planlarınız
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedMealPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`meal-plan-card ${selectedSavedPlanId === plan.id ? 'meal-plan-card-selected' : ''}`}
                    >
                      <button
                        onClick={() => loadSavedPlan(plan.id)}
                        className="block w-full text-left focus:outline-none"
                      >
                        <p className="text-base font-semibold text-gray-800">
                          Plan Tarihi: {new Date(plan.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Kalori: {plan.calculatedCalories} kcal, Öğün: {plan.mealCount}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          Hedef: {plan.weightGoal === 'lose' ? 'Kilo Vermek' : plan.weightGoal === 'gain' ? 'Kilo Almak' : 'Mevcut Kiloyu Korumak'}
                        </p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(plan.id);
                        }}
                        className="meal-plan-delete-btn"
                        title="Diyet Planını Sil"
                        disabled={loading}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Beslenme Planı Oluştur</h2>
              {/* Updated gap to gap-8 for increased spacing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="mx-auto w-full max-w-xs">
                  <label htmlFor="weight" className="block text-base font-semibold text-gray-700 mb-2">
                    Kilo (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Örn: 70"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
                  />
                </div>
                <div className="mx-auto w-full max-w-xs">
                  <label htmlFor="height" className="block text-base font-semibold text-gray-700 mb-2">
                    Boy (cm)
                  </label>
                  <input
                    type="number"
                    id="height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Örn: 175"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
                  />
                </div>
                <div className="mx-auto w-full max-w-xs">
                  <label htmlFor="age" className="block text-base font-semibold text-gray-700 mb-2">
                    Yaş
                  </label>
                  <input
                    type="number"
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Örn: 30"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
                  />
                </div>
                <div className="mx-auto w-full max-w-xs">
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Cinsiyet
                  </label>
                  {/* Applied custom CSS class for gender options spacing */}
                  <div className="gender-options-group">
                    <label className={`radio-option-label ${gender === 'male' ? 'gender-option-male-selected' : 'gender-option-default'}`}>
                      <input
                        type="radio"
                        className="form-radio"
                        name="gender"
                        value="male"
                        checked={gender === 'male'}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      <span className="ml-2 text-base">Erkek</span>
                    </label>
                    <label className={`radio-option-label ${gender === 'female' ? 'gender-option-female-selected' : 'gender-option-default'}`}>
                      <input
                        type="radio"
                        className="form-radio"
                        name="gender"
                        value="female"
                        checked={gender === 'female'}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      <span className="ml-2 text-base">Kadın</span>
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2 mx-auto w-full max-w-xs">
                  <label htmlFor="activityLevel" className="block text-base font-semibold text-gray-700 mb-2">
                    Aktivite Seviyesi
                  </label>
                  <select
                    id="activityLevel"
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200 bg-white text-base"
                  >
                    <option value="">Seçiniz...</option>
                    <option value="sedentary">Sedanter (Çok az egzersiz)</option>
                    <option value="lightly_active">Hafif Aktif (Haftada 1-3 gün egzersiz)</option>
                    <option value="moderately_active">Orta Derece Aktif (Haftada 3-5 gün egzersiz)</option>
                    <option value="very_active">Çok Aktif (Haftada 6-7 gün egzersiz)</option>
                    <option value="extra_active">Ekstra Aktif (Çok yoğun egzersiz/fiziksel iş)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Kilo Hedefi
                  </label>
                  <div className="flex flex-wrap gap-weight-goal mt-1 justify-center md:justify-start"> {/* Applied custom gap class */}
                    <label className={`radio-option-label ${weightGoal === 'lose' ? 'weight-goal-option-selected' : 'weight-goal-option-default'}`}>
                      <input
                        type="radio"
                        className="form-radio"
                        name="weightGoalMain"
                        value="lose"
                        checked={weightGoal === 'lose'}
                        onChange={(e) => setWeightGoal(e.target.value)}
                      />
                      <span className="ml-2 text-base">Kilo Vermek</span>
                    </label>
                    <label className={`radio-option-label ${weightGoal === 'gain' ? 'weight-goal-option-selected' : 'weight-goal-option-default'}`}>
                      <input
                        type="radio"
                        className="form-radio"
                        name="weightGoalMain"
                        value="gain"
                        checked={weightGoal === 'gain'}
                        onChange={(e) => setWeightGoal(e.target.value)}
                      />
                      <span className="ml-2 text-base">Kilo Almak</span>
                    </label>
                    <label className={`radio-option-label ${weightGoal === 'maintain' ? 'weight-goal-option-selected' : 'weight-goal-option-default'}`}>
                      <input
                        type="radio"
                        className="form-radio"
                        name="weightGoalMain"
                        value="maintain"
                        checked={weightGoal === 'maintain'}
                        onChange={(e) => setWeightGoal(e.target.value)}
                      />
                      <span className="ml-2 text-base">Mevcut Kiloyu Korumak</span>
                    </label>
                  </div>
                </div>
              </div>

              {calculatedCalories > 0 && (
                <div className="bg-green-100 p-4 rounded-lg text-center text-green-800 font-semibold text-lg shadow-md">
                  Tahmini Günlük Kalori İhtiyacınız: {calculatedCalories} kcal
                </div>
              )}

              <div>
                <label htmlFor="meals" className="block text-base font-semibold text-gray-700 mb-2">
                  Öğün Sayısı (Günlük)
                </label>
                <input
                  type="number"
                  id="meals"
                  value={mealCount}
                  onChange={(e) => setMealCount(e.target.value)}
                  placeholder="Örn: 3 (Kahvaltı, Öğle, Akşam)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-3">
                  Alerjenler (İçermesin)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allAllergens.map((allergen) => (
                    <div key={allergen} className="flex items-center">
                      <input
                        type="checkbox"
                        id={allergen}
                        checked={selectedAllergens.includes(allergen)}
                        onChange={() => handleAllergenChange(allergen)}
                        className="h-5 w-5 text-green-600 rounded-md focus:ring-green-500 transition-all duration-200"
                      />
                      <label htmlFor={allergen} className="ml-2 text-sm text-gray-800 text-base cursor-pointer">
                        {allergen}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label htmlFor="otherAllergen" className="block text-base font-semibold text-gray-700 mb-2">
                    Diğer Alerjenler (virgülle ayırarak girin)
                  </label>
                  <textarea
                    id="otherAllergen"
                    value={otherAllergen}
                    onChange={(e) => setOtherAllergen(e.target.value)}
                    placeholder="Örn: Kivi, Tarçın, Kabak çekirdeği..."
                    rows="2"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
                  ></textarea>
                </div>
              </div>
            </div>

            <button
              onClick={generateMealPlan}
              className="w-full btn-primary mb-4"
              disabled={loading || calculatedCalories <= 0 || !mealCount || !isAuthReady || !weightGoal}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Plan Oluştur
                </>
              )}
            </button>

            {mealPlan && (
              <button
                onClick={saveCurrentMealPlan}
                className="w-full btn-secondary mb-8"
                disabled={loading || !mealPlan || !isAuthReady || !currentUser}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                    </svg>
                    Planı Kaydet / Güncelle
                  </>
                )}
              </button>
            )}

            {mealPlan && (
              <div className="mt-10 pt-8">
                <h2 className="text-xl font-extrabold text-center text-green-800 mb-6">
                  Haftalık Beslenme Planınız
                </h2>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label htmlFor="editInstruction" className="block text-base font-semibold text-gray-700 mb-2">
                    Planı Düzenle (Örn: "Pazartesi öğle yemeğini ızgara tavuk salatası olarak değiştir")
                  </label>
                  <textarea
                    id="editInstruction"
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    placeholder="Düzenleme talimatınızı buraya yazın..."
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
                  ></textarea>
                  <button
                    onClick={handleEditMealPlan}
                    className="w-full btn-orange mt-4"
                    disabled={loading || !mealPlan || !editInstruction.trim()}
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Planı Güncelle
                      </>
                    )}
                  </button>
                </div>

                <div className="flex overflow-x-auto pb-4 gap-2 mb-6">
                  {mealPlan.map((dayData, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDayIndex(index)}
                      className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap
                                  ${selectedDayIndex === index ? 'selected-day' : 'default-day'}
                                  transition-all duration-200
                                `}
                    >
                      {dayData.day}
                    </button>
                  ))}
                </div>

                {mealPlan[selectedDayIndex] && (
                  <div className="bg-green-50 p-6 rounded-xl shadow-md border border-green-200">
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      {mealPlan[selectedDayIndex].day}
                    </h3>
                    {mealPlan[selectedDayIndex].motivationQuote && (
                      <p className="text-sm italic text-gray-600 mb-4">
                        "{mealPlan[selectedDayIndex].motivationQuote}"
                      </p>
                    )}
                    <ul className="space-y-4">
                      {mealPlan[selectedDayIndex].meals.map((meal, mealIndex) => (
                        <li
                          key={mealIndex}
                          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200"
                          onClick={() => fetchRecipe(meal.name, meal.description)}
                        >
                          <p className="text-base font-semibold text-gray-900 mb-1">{meal.name}</p>
                          <p className="text-sm text-gray-700 text-base">{meal.description}</p>
                          {(meal.calories || meal.carbohydrates || meal.protein || meal.fat) && (
                            <div className="mt-2 text-xs text-gray-600">
                              {meal.calories && <p><span className="font-semibold">Kalori:</span> {meal.calories} kcal</p>}
                              {meal.carbohydrates && <p><span className="font-semibold">Karbonhidrat:</span> {meal.carbohydrates}g</p>}
                              {meal.protein && <p><span className="font-semibold">Protein:</span> {meal.protein}g</p>}
                              {meal.fat && <p><span className="font-semibold">Yağ:</span> {meal.fat}g</p>}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showRecipeModal && (
        <RecipeModal
          recipe={currentRecipe}
          onClose={() => setShowRecipeModal(false)}
          loading={recipeLoading}
          error={recipeError}
        />
      )}

      <ConfirmationModal
        show={showDeleteConfirmation}
        message="Bu diyet listesini silmek istediğinize emin misiniz?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={loading}
      />
    </div>
  );
}

// InitialChoiceScreen Component: Initial choice screen when the app opens
function InitialChoiceScreen({ onChooseAuth }) {
  return (
    <div className="min-h-screen bg-gradient-br flex items-center justify-center p-4 font-inter">
      {/* Removed hover:scale-105 from this div */}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center transform transition-all duration-300">
        <h1 className="text-4xl font-extrabold text-green-800 tracking-tight mb-8">
          NutritionAI
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Sağlıklı beslenme yolculuğunuza hoş geldiniz!
        </p>
        <div className="space-y-4">
          <button
            onClick={() => onChooseAuth('login')}
            className="w-full btn-primary"
          >
            Giriş Yap
          </button>
          <button
            onClick={() => onChooseAuth('register')}
            className="w-full btn-secondary" // Changed class to btn-secondary for blue style
          >
            Kayıt Ol
          </button>
        </div>
      </div>
    </div>
  );
}

// Main App Component: Manages the overall structure of the application and authentication flow
function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [pendingMealPlanToSave, setPendingMealPlanToSave] = useState(null);

  const [appMode, setAppMode] = useState('initial');

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState('login');

  // These variables are provided by the Canvas environment.
  // We use a typeof check to prevent 'undefined' errors in local development.
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  useEffect(() => {
    try {
      // Firebase configuration updated with the provided API Key and other details
      const firebaseConfig = {
        apiKey: "AIzaSyAuFL9wSgRHWop747_9NgH5tLmWsL6aygQ", // Updated Firebase API Key
        authDomain: "nutritionaiapp.firebaseapp.com",
        projectId: "nutritionaiapp",
        storageBucket: "nutritionaiapp.firebasestorage.app",
        messagingSenderId: "239220731973",
        appId: "1:239220731973:web:980e255eca6b0c0becf32c"
      };

      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authInstance = getAuth(app);

      setDb(firestore);
      setAuth(authInstance);

      const unsubscribeAuth = onAuthStateChanged(authInstance, async (user) => {
        setCurrentUser(user);
        setIsAuthReady(true);
        setAuthLoading(false);

        // If no user and custom token is available, try to sign in with custom token
        if (!user && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          try {
            await signInWithCustomToken(authInstance, __initial_auth_token);
          } catch (error) {
            console.warn("Automatic login failed (internal issue):", error.message);
            setAppMode('initial');
          }
        } else if (!user) {
          setAppMode('initial');
        } else {
          setAppMode('app');
          setShowAuthModal(false);
        }
      });

      return () => unsubscribeAuth();
    } catch (error) {
      console.error("Firebase initialization error:", error);
      setErrorMessage("Uygulama başlatılırken bir hata oluştu: " + error.message);
      setAuthLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      if (auth) {
        await signOut(auth);
        setSuccessMessage('Başarıyla çıkış yapıldı.');
        setAppMode('initial');
        setCurrentUser(null);
      }
    } catch (error) {
      setErrorMessage('Çıkış yapılırken bir hata oluştu: ' + error.message);
      console.error('Çıkış hatası:', error);
    }
  };

  const handleChooseAuth = (mode) => {
    setAuthModalInitialMode(mode);
    setShowAuthModal(true);
  };

  const triggerLoginPrompt = () => {
    setAuthModalInitialMode('login');
    setShowAuthModal(true);
    setErrorMessage('Bu işlemi yapmak için giriş yapmalısınız!');
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-br flex items-center justify-center p-4 font-inter">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center text-green-800 font-bold text-2xl">
          Yükleniyor...
          <svg className="animate-spin h-8 w-8 mx-auto mt-4 text-green-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  let contentToRender;
  if (appMode === 'initial') {
    contentToRender = <InitialChoiceScreen onChooseAuth={handleChooseAuth} />;
  } else if (appMode === 'app') {
    contentToRender = (
      <NutritionAIAppContent
        db={db}
        auth={auth}
        currentUser={currentUser}
        isAuthReady={isAuthReady}
        errorMessage={errorMessage}
        successMessage={successMessage}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
        handleLogout={handleLogout}
        triggerLoginPrompt={triggerLoginPrompt}
        pendingMealPlanToSave={pendingMealPlanToSave}
        setPendingMealPlanToSave={setPendingMealPlanToSave}
        appId={appId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-br flex items-center justify-center p-4 font-inter">
      {/* Removed Tailwind CSS JIT CDN script */}
      <style>{appStyles}</style>
      {/* Genişletilmiş ana uygulama kapsayıcısı. max-w-2xl yerine max-w-7xl kullanıldı. */}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-7xl transform transition-all duration-300">
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {contentToRender}

        {showAuthModal && (
          <div className="fixed inset-0 bg-black-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
              <AuthPage
                auth={auth}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
                onAuthSuccess={handleAuthSuccess}
                initialMode={authModalInitialMode}
              />
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setSuccessMessage('');
                }}
                className="mt-4 w-full btn-gray-200"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
