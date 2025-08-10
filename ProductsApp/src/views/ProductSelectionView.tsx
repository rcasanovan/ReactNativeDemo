import React, { useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { observer } from 'mobx-react-lite';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { ProductCard } from '../components/ProductCard';
import { useAppStore } from '../contexts/AppContext';
import { Product } from '../models/Product';

type ProductSelectionViewRouteProp = RouteProp<RootStackParamList, 'ProductSelection'>;
type ProductSelectionViewNavigationProp = StackNavigationProp<RootStackParamList, 'ProductSelection'>;

export const ProductSelectionView: React.FC = observer(() => {
  const navigation = useNavigation<ProductSelectionViewNavigationProp>();
  const route = useRoute<ProductSelectionViewRouteProp>();
  const { store } = useAppStore();
  const viewModel = store.productSelectionViewModel;

  // Load products if not already loaded
  useEffect(() => {
    if (viewModel.products.length === 0 && !viewModel.loading) {
      viewModel.loadProducts();
    }
  }, [viewModel.products.length, viewModel.loading]);

  useEffect(() => {
    // Handle updated cart and sale type from PaymentScreen
    if (route.params?.updatedCart) {
      viewModel.updateCartFromPayment(route.params.updatedCart);
    }
    if (route.params?.selectedSaleType) {
      viewModel.setSelectedSaleType(route.params.selectedSaleType);
    }
  }, [route.params?.updatedCart, route.params?.selectedSaleType]);

  const handleProceedToPayment = () => {
    if (!viewModel.canProceedToPayment) {
      Alert.alert('Empty Cart', 'Please add some products to your cart');
      return;
    }
    
    navigation.navigate('Payment', viewModel.getPaymentData());
  };

    const renderProduct = ({ item }: { item: Product }) => {
    return (
      <ProductCard
        product={item}
        quantity={viewModel.getCartQuantity(item.id)}
        onAdd={(product) => viewModel.addToCart(product)}
        onRemove={(product) => viewModel.removeFromCart(product)}
        selectedCurrency={viewModel.selectedCurrency}
        selectedSaleType={viewModel.selectedSaleType}
      />
    );
  };

  const alternativeCurrencies = viewModel.alternativeCurrencies;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>

      </View>



      {/* Filter Section */}
      <View style={styles.filterSection}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => viewModel.setShowFilterDropdown(true)}
        >
          <Text style={styles.filterButtonText}>
            Filter: {viewModel.selectedFilter === 'all' ? 'All Products' : viewModel.selectedFilter}
          </Text>
          <Text style={styles.filterChevron}>▼</Text>
        </TouchableOpacity>
        
        {viewModel.selectedFilter !== 'all' && (
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => viewModel.setSelectedFilter('all')}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Product Grid */}
      {viewModel.loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : viewModel.filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No products available</Text>
          <Text style={styles.emptySubtext}>Please check your connection and try again</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => viewModel.loadProducts()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={viewModel.filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productGrid}
          showsVerticalScrollIndicator={false}
          style={{ zIndex: 1 }}
        />
      )}

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {/* Main Payment Button */}
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity
            style={[styles.paymentButton, !viewModel.canProceedToPayment && styles.paymentButtonDisabled]}
            onPress={handleProceedToPayment}
            disabled={!viewModel.canProceedToPayment}
          >
            {/* Left Segment - Payment */}
            <View style={styles.paymentSegment}>
              <Text style={styles.paymentText}>
                PAGAR $ <Text style={styles.paymentAmount}>
                  {viewModel.total.toFixed(2)}
                </Text> {viewModel.selectedCurrency}
              </Text>
            </View>
            
            {/* Right Segment - Sale Type */}
            <TouchableOpacity
              style={styles.businessSegment}
              onPress={() => viewModel.setShowSaleTypeDropdown(true)}
            >
              <View style={styles.businessContent}>
                <Text style={styles.businessText}>{viewModel.selectedSaleType}</Text>
                <Text style={styles.chevronIcon}>▼</Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Alternative Currencies */}
        {Object.keys(alternativeCurrencies).length > 0 && (
          <TouchableOpacity 
            style={styles.currencyDisplay}
            onPress={() => viewModel.setShowCurrencyDropdown(true)}
          >
            <Text style={styles.currencyText}>
              {Object.values(alternativeCurrencies).join(' | ')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Currency Dropdown Modal */}
        {viewModel.showCurrencyDropdown && (
          <Modal
            visible={viewModel.showCurrencyDropdown}
            transparent
            animationType="slide"
            onRequestClose={() => viewModel.setShowCurrencyDropdown(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <SafeAreaView style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Currency</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => viewModel.setShowCurrencyDropdown(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </SafeAreaView>
                
                <FlatList
                  data={['EUR', 'USD', 'GBP']}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.option,
                        item === viewModel.selectedCurrency && styles.selectedOption,
                      ]}
                      onPress={() => {
                        viewModel.setSelectedCurrency(item as any);
                        viewModel.setShowCurrencyDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          item === viewModel.selectedCurrency && styles.selectedOptionText,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* Sale Type Dropdown Modal */}
        {viewModel.showSaleTypeDropdown && (
          <Modal
            visible={viewModel.showSaleTypeDropdown}
            transparent
            animationType="slide"
            onRequestClose={() => viewModel.setShowSaleTypeDropdown(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <SafeAreaView style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Sale Type</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => viewModel.setShowSaleTypeDropdown(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </SafeAreaView>
                
                <FlatList
                  data={['Retail', 'Crew', 'Happy hour', 'Invitación business', 'Invitación turista']}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.option,
                        item === viewModel.selectedSaleType && styles.selectedOption,
                      ]}
                      onPress={() => {
                        viewModel.setSelectedSaleType(item as any);
                        viewModel.setShowSaleTypeDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          item === viewModel.selectedSaleType && styles.selectedOptionText,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* Filter Dropdown Modal */}
        {viewModel.showFilterDropdown && (
          <Modal
            visible={viewModel.showFilterDropdown}
            transparent
            animationType="slide"
            onRequestClose={() => viewModel.setShowFilterDropdown(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <SafeAreaView style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Filter by Type</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => viewModel.setShowFilterDropdown(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </SafeAreaView>
                
                <FlatList
                  data={viewModel.productTypes}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.option,
                        item === viewModel.selectedFilter && styles.selectedOption,
                      ]}
                      onPress={() => {
                        viewModel.setSelectedFilter(item);
                        viewModel.setShowFilterDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          item === viewModel.selectedFilter && styles.selectedOptionText,
                        ]}
                      >
                        {item === 'all' ? 'All Products' : item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    paddingTop: Platform.OS === 'ios' ? 20 : 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 20 : 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginRight: 4,
  },
  filterChevron: {
    fontSize: 12,
    color: '#666',
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  productGrid: {
    padding: 4,
    justifyContent: 'space-between',
  },
  bottomBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    padding: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  paymentButtonContainer: {
    marginBottom: 12,
  },
  paymentButton: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentButtonDisabled: {
    opacity: 0.6,
  },
  paymentSegment: {
    flex: 2,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  paymentText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  paymentAmount: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  businessSegment: {
    flex: 1,
    backgroundColor: '#4A5568',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  businessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  businessText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  chevronIcon: {
    color: 'white',
    fontSize: 10,
    marginLeft: 2,
  },
  currencyDisplay: {
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'ios' ? 32 : 16,
    paddingVertical: Platform.OS === 'ios' ? 20 : 16,
    paddingTop: Platform.OS === 'ios' ? 24 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: Platform.OS === 'ios' ? 20 : 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: Platform.OS === 'ios' ? 8 : 0,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  option: {
    paddingHorizontal: Platform.OS === 'ios' ? 32 : 16,
    paddingVertical: Platform.OS === 'ios' ? 20 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedOption: {
    backgroundColor: '#F0F8FF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
