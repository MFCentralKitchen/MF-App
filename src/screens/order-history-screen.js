import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useSelector} from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';

const OrderHistoryScreen = () => {
  const {user} = useSelector(state => state.user); // Get user details from Redux
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Create a real-time listener to fetch orders
    const unsubscribe = firestore()
      .collection('invoices')
      .where('userId', '==', user.id)
      .onSnapshot((ordersSnapshot) => {
        const userOrders = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(userOrders);
      }, (error) => {
        console.error('Error fetching orders:', error);
      });

    // Cleanup function to unsubscribe from listener on component unmount
    return () => unsubscribe();
  }, [user.id]);

  const renderOrderItem = ({item}) => (
    <View style={styles.orderCard}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderText}>Order ID: #{item.id}</Text>
        <View style={{flexDirection:'row',marginTop:5}}>
        <Text style={styles.orderText}>
          Order Status:

        </Text>
          <View
            style={[
              styles.statusValue,
              item.orderStatus === 'pending'
                ? styles.pendingStatus
                : item.orderStatus === 'accepted'
                ? styles.acceptedStatus
                : item.orderStatus === 'shipped'
                ? styles.shippedStatus
                : item.orderStatus === 'delivered'
                ? styles.deliveredStatus
                : styles.defaultStatus,
            ]}>
            <Text style={styles.statusText}>
              {item.orderStatus.charAt(0).toUpperCase() + item.orderStatus.slice(1)}{' '}
            </Text>
          </View>
        </View>
        <View style={{flexDirection:'row',marginTop:5}}>
        <Text style={styles.orderText}>
          Payment Status:
          </Text>
          <View
            style={[
              styles.statusValue,
              item.isBillPaid 
                ? styles.paidStatus
                : styles.paymentPendingStatus,
            ]}>
            <Text style={styles.statusText}>
              {item.isBillPaid ? 'Paid' : 'Pending'}
            </Text>
          </View>
          </View>
      </View>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => {
          setSelectedOrder(item);
          setModalVisible(true);
        }}>
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  );
  

  const renderOrderItems = () => (
    <ScrollView style={styles.modalContent}>
      <Text style={styles.modalTitle}>Order Details</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, {width: '40%'}]}>Title</Text>
        <Text style={[styles.tableHeaderText, {width: '20%'}]}>Brand</Text>
        <Text style={[styles.tableHeaderText, {width: '17%'}]}>Units</Text>
        <Text style={[styles.tableHeaderText, {width: '22%'}]}>Quantity</Text>
      </View>
      {selectedOrder.items.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, {width: '40%'}]}>{item.title}</Text>
          <Text style={[styles.tableCell, {width: '20%'}]}>{item.brand}</Text>
          <Text style={[styles.tableCell, {width: '17%'}]}>{item.units}</Text>
          <Text style={[styles.tableCell, {width: '22%'}]}>
            {item.quantity}
          </Text>
        </View>
      ))}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setModalVisible(false)}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </ScrollView>
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
          onRequestClose={() => setModalVisible(false)}>
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
    color: 'black', // Red text color
    marginBottom: 5,
    marginTop:5,
    fontWeight:'bold'
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
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tableCell: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#D32F2F',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    marginBottom:30,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statusValue: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginLeft: 7,
    fontWeight: 'bold',
    fontSize: 15,
  },
  pendingStatus: {
    backgroundColor: '#FFC107', // Yellow background for pending
    color: '#fff', // White text color
  },
  acceptedStatus: {
    backgroundColor: '#2196F3', // Blue background for accepted
    color: '#fff', // White text color
  },
  shippedStatus: {
    backgroundColor: '#FF9800', // Orange background for shipped
    color: '#fff', // White text color
  },
  deliveredStatus: {
    backgroundColor: '#4CAF50', // Green background for delivered
    color: '#fff', // White text color
  },
  defaultStatus: {
    backgroundColor: '#9E9E9E', // Gray background for other statuses
    color: '#fff', // White text color
  },
  paidStatus: {
    backgroundColor: '#4CAF50', // Green background for paid
    color: '#fff', // White text color
  },
  paymentPendingStatus: {
    backgroundColor: '#FFC107', // Yellow background for payment pending
    color: '#fff', // White text color
  },
  statusText: {
    color: '#fff', // White text color
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default OrderHistoryScreen;
