import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';

const OrderHistoryScreen = () => {
  const { user } = useSelector(state => state.user); // Get user details from Redux
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersSnapshot = await firestore()
          .collection('invoices')
          .where('userId', '==', user.id)
          .get();

        const userOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [user.id]);

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderText}>Order ID: #{item.id}</Text>
        <Text style={styles.orderText}>Order Status: {item.orderStatus}</Text>
        <Text style={styles.orderText}>Payment Status: {item.paymentStatus || 'Pending'}</Text>
      </View>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => {
          setSelectedOrder(item);
          setModalVisible(true);
        }}
      >
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOrderItems = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Order Details</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText,{width: '50%'}]}>Title</Text>
        <Text style={[styles.tableHeaderText,{width: '25%'}]}>Brand</Text>
        <Text style={[styles.tableHeaderText,{width: '25%'}]}>Quantity</Text>
      </View>
      {selectedOrder.items.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell,{width: '50%'}]}>{item.title}</Text>
          <Text style={[styles.tableCell,{width: '25%'}]}>{item.brand}</Text>
          <Text style={[styles.tableCell,{width: '25%'}]}>{item.quantity}</Text>
        </View>
      ))}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Order History</Text>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      {selectedOrder && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>{renderOrderItems()}</View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D32F2F', // Red theme color
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#FFF8E1', // Mustard yellow background
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderText: {
    fontSize: 16,
    color: '#D32F2F', // Red text color
    marginBottom: 5,
  },
  viewButton: {
    backgroundColor: '#D32F2F', // Red button color
    padding: 10,
    borderRadius: 5,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 15,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
    textAlign:'center'
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tableCell: {
    fontSize: 16,
    color: '#333',
    textAlign:'center'
  },
  closeButton: {
    backgroundColor: '#D32F2F',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default OrderHistoryScreen;
