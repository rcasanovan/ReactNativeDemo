# Refrescos App

A React Native mobile application for managing drink sales and payments, designed for flight services.

## Features

- **Product Selection**: Browse and select drinks from a catalog
- **Shopping Cart**: Add/remove products and manage quantities
- **Multi-Currency Support**: EUR, USD, and GBP with real-time conversion
- **Payment Processing**: Cash and card payment options
- **Seat Assignment**: Assign seats to orders
- **Stock Management**: Track product inventory

## Current Implementation Status

### ✅ Completed
- Project setup with React Native 0.80.2
- TypeScript configuration
- Basic folder structure
- Type definitions for Products, Cart, Currency, and Payment
- API service with mock data
- Currency conversion utility

### 🚧 In Progress
- Screen 1: Product selection and cart management
- Screen 2: Payment and ticket details
- Navigation setup
- UI components

### 📋 Planned
- Unit tests
- iOS/Android build configuration
- Stock reduction after payment
- Real API integration

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/       # App screens
├── services/      # API and business logic
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## API Endpoints

The app currently uses mock data, but is designed to work with:
- `GET /products` - Fetch available products
- `POST /payments` - Process payment transactions

## Currency Support

The app supports three currencies with mock exchange rates:
- EUR (Euro) - Base currency
- USD (US Dollar)
- GBP (British Pound)

Exchange rates are hardcoded for demo purposes but can be easily replaced with real API calls.
