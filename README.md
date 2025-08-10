# Refrescos App

A React Native mobile application for managing drink sales and payments, designed for flight services. Built with **MVVM (Model-View-ViewModel)** architecture using **MobX** for state management.

## 🏗️ Architecture

This app follows the **MVVM (Model-View-ViewModel)** pattern with the following components:

### 📱 Models (Data Layer)
- **Product.ts** - Product data model with business logic
- **Cart.ts** - Shopping cart model with inventory management  
- **CartItem.ts** - Individual cart item model

### 🧠 ViewModels (Business Logic Layer)
- **ProductSelectionViewModel.ts** - Manages product listing, filtering, and cart operations
- **PaymentViewModel.ts** - Manages payment processing, form validation, and payment flow

### 🎨 Views (UI Layer)
- **ProductSelectionView.tsx** - Product listing and selection interface
- **PaymentView.tsx** - Payment processing interface with original design

### 📦 Store (State Management)
- **AppStore.ts** - Centralized state management
- **AppContext.tsx** - React context for store access

### 🔄 State Management with MobX
The app uses **MobX** for reactive state management:
- `makeAutoObservable()` for automatic reactivity
- `observer()` wrapper for React components
- `runInAction()` for state mutations
- Computed properties for derived state

## 📱 Screenshots

### iOS Screenshots

#### Product Selection Screen
Browse drinks, manage cart, select currency, and choose sale type.

![iOS Product Selection](Images/iOS/Simulator%20Screenshot%20-%20iPhone%2016%20-%202025-08-10%20at%2018.09.31.png)

#### Payment Screen
Process payments with seat assignment and cart review.

![iOS Payment Screen](Images/iOS/Simulator%20Screenshot%20-%20iPhone%2016%20-%202025-08-10%20at%2018.09.36.png)

#### Card Payment Modal
Secure card payment with real-time validation and auto-formatting.

![iOS Card Payment](Images/iOS/Simulator%20Screenshot%20-%20iPhone%2016%20-%202025-08-10%20at%2018.09.43.png)

#### Cash Payment Modal
Cash payment with change calculation and Spanish locale support.

![iOS Cash Payment](Images/iOS/Simulator%20Screenshot%20-%20iPhone%2016%20-%202025-08-10%20at%2018.09.50.png)

### Android Screenshots

#### Product Selection Screen
Browse drinks, manage cart, select currency, and choose sale type.

![Android Product Selection](Images/Android/Screenshot_1754842400.png)

#### Payment Screen
Process payments with seat assignment and cart review.

![Android Payment Screen](Images/Android/Screenshot_1754842394.png)

#### Card Payment Modal
Secure card payment with real-time validation and auto-formatting.

![Android Card Payment](Images/Android/Screenshot_1754842388.png)

#### Cash Payment Modal
Cash payment with change calculation and Spanish locale support.

![Android Cash Payment](Images/Android/Screenshot_1754842383.png)

## 🛠️ Technology Stack

### Core Framework
- **React Native**: `0.80.2`
- **TypeScript**: `5.0.0+`
- **Node.js**: `18.0.0+`

### State Management
- **MobX**: `6.12.0`
- **mobx-react-lite**: `4.0.5`

### Navigation
- **React Navigation**: `6.1.0`
- **@react-navigation/native**: `6.1.0`
- **@react-navigation/stack**: `6.3.0`

### UI Components
- **React Native Gesture Handler**: `2.14.0`
- **React Native Safe Area Context**: `4.8.0`

### Development Tools
- **Metro**: `0.80.2`
- **Babel**: `7.23.0`
- **Jest**: `29.7.0`
- **ESLint**: `8.57.0`

## ✨ Features

### 🛍️ Product Management
- **Product Selection**: Browse and select drinks from a catalog
- **Shopping Cart**: Add/remove products and manage quantities
- **Stock Management**: Track product inventory
- **Sale Types**: Retail, Crew, Happy Hour, Business Invitation, Tourist Invitation

### 💰 Payment System
- **Multi-Currency Support**: EUR, USD, and GBP with real-time conversion
- **Payment Methods**: Cash and card payment options
- **Form Validation**: Real-time validation for card details
- **Change Calculation**: Automatic change calculation for cash payments
- **Transaction Processing**: Mock API integration with success/error handling

### 🎫 Order Management
- **Seat Assignment**: Assign seats to orders (Row A-Z, Seat 1-50)
- **Receipt Generation**: Detailed order receipts
- **Order History**: Track completed transactions

### 🌍 Internationalization
- **Multi-Language Support**: English UI with Spanish locale handling
- **Currency Formatting**: Proper currency display and conversion
- **Decimal Separator**: Automatic comma-to-period conversion for Spanish locale

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ProductsApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Run the app**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ProductCard.tsx
│   └── Dropdown.tsx
├── models/             # Data models (MVVM)
│   ├── Product.ts
│   ├── Cart.ts
│   └── CartItem.ts
├── viewmodels/         # Business logic (MVVM)
│   ├── ProductSelectionViewModel.ts
│   └── PaymentViewModel.ts
├── views/              # UI components (MVVM)
│   ├── ProductSelectionView.tsx
│   └── PaymentView.tsx
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── services/           # API and external services
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── currencyConverter.ts
│   └── discountCalculator.ts
└── contexts/           # React contexts
    └── AppContext.tsx
```

## 🔧 Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## 📊 API Integration

The app currently uses mock data but is designed to work with:
- `GET /products` - Fetch available products
- `POST /payments` - Process payment transactions

### Mock Data Structure
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  currency: 'EUR' | 'USD' | 'GBP';
  image: string;
  inventory: number;
}
```

## 💱 Currency Support

The app supports three currencies with real-time conversion:
- **EUR** (Euro) - Base currency
- **USD** (US Dollar) 
- **GBP** (British Pound)

Exchange rates are currently hardcoded for demo purposes but can be easily replaced with real API calls.

## 🧪 Testing

The app includes comprehensive unit tests:
- Component testing with React Testing Library
- ViewModel testing with MobX
- API service testing
- Utility function testing

## 📱 Platform Support

- **iOS**: 13.0+
- **Android**: API level 21+ (Android 5.0+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.
