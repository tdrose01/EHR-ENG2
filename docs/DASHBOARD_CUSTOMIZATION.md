# 🎨 Dashboard Customization Guide

## 🚀 Quick Customization

### **1. Change Color Scheme**

#### **Primary Colors**
```vue
<!-- In RealTimeMonitoringDashboard.vue -->
<!-- Change the main gradient -->
<div class="real-time-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
<!-- To a different color scheme, e.g., green theme: -->
<div class="real-time-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white">
```

#### **Card Colors**
```vue
<!-- Change individual card colors -->
<!-- Connection Status Card -->
<div class="bg-gradient-to-br from-slate-800/80 to-blue-800/80 rounded-xl p-6 border border-blue-500/30">
<!-- To green theme: -->
<div class="bg-gradient-to-br from-slate-800/80 to-green-800/80 rounded-xl p-6 border border-green-500/30">
```

### **2. Modify Layout**

#### **Grid Layouts**
```vue
<!-- Change card grid layout -->
<!-- From 4 columns to 3 columns -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
<!-- To: -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

<!-- From 2 columns to 1 column for data streams -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
<!-- To: -->
<div class="grid grid-cols-1 gap-6 mb-8">
```

#### **Spacing**
```vue
<!-- Adjust margins and padding -->
<!-- Increase spacing between sections -->
<div class="max-w-7xl mx-auto p-6">
<!-- To: -->
<div class="max-w-7xl mx-auto p-8">

<!-- Increase gap between cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
<!-- To: -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
```

### **3. Customize Animations**

#### **Animation Speed**
```css
/* In the <style> section */
/* Change animation duration */
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
/* To slower: */
.transition-all {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Change slide-in animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
/* To faster: */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### **4. Modify Chart Colors**

#### **Chart Dataset Colors**
```javascript
// In RealTimeChart.vue
const chartConfig = {
  data: {
    datasets: [
      {
        label: 'HP10 (mSv)',
        borderColor: '#3b82f6',  // Blue
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        // Change to green:
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      },
      {
        label: 'HP07 (mSv)',
        borderColor: '#06b6d4',  // Cyan
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        // Change to orange:
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
      }
    ]
  }
}
```

### **5. Add New Features**

#### **Add a New Status Card**
```vue
<!-- Add this after the existing status cards -->
<div class="bg-gradient-to-br from-pink-900/80 to-rose-800/80 rounded-xl p-6 border border-pink-500/30 shadow-xl backdrop-blur-sm">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-pink-200 text-sm font-medium">System Load</p>
      <p class="text-2xl font-bold text-pink-400">{{ systemLoad }}%</p>
    </div>
    <div class="text-4xl">⚡</div>
  </div>
  <div class="mt-4 text-xs text-pink-300">
    CPU: {{ cpuUsage }}% | Memory: {{ memoryUsage }}%
  </div>
</div>
```

#### **Add a New Data Stream**
```vue
<!-- Add this after the existing data streams -->
<div class="bg-gradient-to-br from-slate-800/80 to-yellow-900/80 rounded-xl p-6 border border-yellow-500/30 shadow-xl backdrop-blur-sm">
  <div class="flex items-center justify-between mb-6">
    <h3 class="text-xl font-semibold text-yellow-400 flex items-center">
      🌡️ Temperature Readings
      <span class="ml-2 text-sm bg-yellow-500/20 px-2 py-1 rounded-full">{{ temperatureReadings.length }}</span>
    </h3>
    <button 
      @click="clearTemperatures"
      class="text-xs bg-yellow-600/30 hover:bg-yellow-600/50 px-3 py-1 rounded-lg transition-colors border border-yellow-500/30"
    >
      Clear
    </button>
  </div>
  <div class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
    <!-- Temperature reading items -->
  </div>
</div>
```

### **6. Customize Notifications**

#### **Notification Styles**
```vue
<!-- Modify notification appearance -->
<div 
  v-for="notification in notifications.slice(0, 20)" 
  :key="notification.id"
  class="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-lg p-4 border-l-4 backdrop-blur-sm transition-all duration-200 hover:scale-105"
  :class="{
    'border-red-500': notification.priority === 'high',
    'border-yellow-500': notification.priority === 'normal',
    'border-blue-500': notification.priority === 'low',
    'opacity-60': notification.read
  }"
>
<!-- Add custom priority colors: -->
:class="{
  'border-red-500 bg-gradient-to-r from-red-900/50 to-pink-900/50': notification.priority === 'high',
  'border-yellow-500 bg-gradient-to-r from-yellow-900/50 to-orange-900/50': notification.priority === 'normal',
  'border-blue-500 bg-gradient-to-r from-blue-900/50 to-cyan-900/50': notification.priority === 'low',
  'opacity-60': notification.read
}"
```

### **7. Responsive Design**

#### **Mobile Layout**
```vue
<!-- Adjust grid layouts for mobile -->
<!-- Current: -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
<!-- Mobile-first approach: -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">

<!-- Adjust spacing for mobile -->
<div class="max-w-7xl mx-auto p-6">
<!-- Mobile responsive: -->
<div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
```

### **8. Performance Optimizations**

#### **Reduce Animations**
```css
/* Disable animations for performance -->
.transition-all {
  transition: none;
}

.hover\:scale-105:hover {
  transform: none;
}

/* Or reduce animation complexity */
@keyframes slideIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

#### **Limit Data Points**
```javascript
// In RealTimeChart.vue, reduce data points
// Keep only last 25 data points instead of 50
if (dataPoints.value.length > 25) {
  dataPoints.value = dataPoints.value.slice(-25)
}
```

## 🎯 Quick Theme Switcher

### **Dark Theme (Current)**
```vue
<div class="real-time-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
```

### **Light Theme**
```vue
<div class="real-time-dashboard min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 text-gray-900">
```

### **Green Theme**
```vue
<div class="real-time-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white">
```

### **Purple Theme**
```vue
<div class="real-time-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 text-white">
```

## 🔧 Advanced Customization

### **Custom CSS Variables**
```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #06b6d4;
  --accent-color: #a855f7;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
}
```

### **Dynamic Themes**
```javascript
// Add theme switching functionality
const themes = {
  dark: {
    background: 'from-slate-900 via-blue-900 to-indigo-900',
    text: 'text-white'
  },
  light: {
    background: 'from-gray-50 via-blue-50 to-indigo-100',
    text: 'text-gray-900'
  },
  green: {
    background: 'from-slate-900 via-green-900 to-emerald-900',
    text: 'text-white'
  }
}
```

---

## 🎨 Pro Tips

1. **Use CSS Variables** for consistent theming
2. **Test on Mobile** after every major change
3. **Keep Animations Subtle** for professional look
4. **Use Semantic Colors** (red for alerts, green for success)
5. **Maintain Contrast** for accessibility
6. **Optimize Images** and use SVGs when possible

---

**🎯 Your dashboard is now fully customizable! Experiment with different colors, layouts, and features to make it perfect for your needs.**
