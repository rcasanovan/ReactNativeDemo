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
- [x] Project setup with React Native 0.80.2
- [x] TypeScript configuration
- [x] Basic folder structure
- [x] Type definitions for Products, Cart, Currency, and Payment
- [x] API service with mock data
- [x] Currency conversion utility
- [x] **Screen 1: Product Selection Screen**
  - [x] Product grid display with mock data
  - [x] Cart management (add/remove items)
  - [x] Currency selection (EUR, USD, GBP)
  - [x] Real-time currency conversion display
  - [x] Sale type selection (Retail, Crew, Happy hour, etc.)
  - [x] Total calculation
  - [x] Navigation to Payment screen
- [x] **Screen 2: Payment Screen**
  - [x] Ticket details display
  - [x] Seat assignment input
  - [x] Payment method selection (Cash/Card)
  - [x] Cart items review
  - [x] Payment processing with mock API
  - [x] Success/error handling
  - [x] Navigation back to product selection after payment
- [x] React Navigation setup
- [x] Android build and deployment
- [x] Basic unit tests for components

### 🔄 In Progress
- [ ] iOS build and deployment
- [ ] Unit test improvements

### 📋 Planned
- [ ] Stock reduction after successful payment (bonus)
- [ ] Real API integration (bonus)
- [ ] Additional UI improvements

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
