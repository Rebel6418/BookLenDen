const axios = require('axios');

class ShiprocketService {
  constructor() {
    this.baseURL = 'https://apiv2.shiprocket.in/v1/external';
    this.email = process.env.SHIPROCKET_EMAIL;
    this.password = process.env.SHIPROCKET_PASSWORD;
    this.token = null;
    this.tokenExpiry = null;
  }

  // Get Authentication Token
  async getToken() {
    try {
      // Return cached token if still valid
      if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.token;
      }

      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.email,
        password: this.password
      });

      this.token = response.data.token;
      // Token is valid for 10 days
      this.tokenExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      
      console.log('✅ Shiprocket token generated successfully');
      return this.token;

    } catch (error) {
      console.error('❌ Shiprocket auth error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Shiprocket');
    }
  }

  // Create Order in Shiprocket with AUTOMATIC & DYNAMIC Address Pickup
  async createOrderWithAutoAddress(order, seller) {
    try {
      const token = await this.getToken();

      // Validate seller address
      if (!seller.sellerAddress || !seller.sellerAddress.pincode) {
        throw new Error('Seller address is incomplete. Please complete your seller profile.');
      }

      // Validate buyer address
      if (!order.shippingAddress || !order.shippingAddress.pincode) {
        throw new Error('Buyer shipping address is incomplete.');
      }

      // ✅ AUTOMATIC ADDRESS PICKUP FROM DATABASE
      const pickupAddress = seller.sellerAddress;
      const deliveryAddress = order.shippingAddress;

      // Prepare order items for Shiprocket
      const orderItems = order.items.map((item, index) => ({
        name: item.title,
        sku: `BOOK-${item.book.toString()}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 490110  // HSN code for books in India
      }));

      // Calculate total weight (default 500gm per book)
      const totalWeight = order.items.reduce((sum, item) => {
        return sum + (0.5 * item.quantity);  // 0.5kg per book
      }, 0);

      // ✅ DYNAMIC PICKUP LOCATION NAME (P2P Marketplace Solution)
      // Each seller gets unique pickup location identifier
      const dynamicPickupLocation = `${pickupAddress.city}-${seller._id.toString().slice(-4)}`;

      // Prepare Shiprocket order data
      const shiprocketOrderData = {
        order_id: order._id.toString(),
        order_date: new Date(order.orderDate).toISOString().split('T')[0],
        
        // ✅ DYNAMIC PICKUP LOCATION (Different for each seller!)
        pickup_location: dynamicPickupLocation,
        
        channel_id: "",  // Optional: Your channel ID if configured
        comment: "BookLenDen P2P Marketplace Order - " + order.invoiceNumber,
        
        // ✅ PICKUP ADDRESS (Seller's Home Address - AUTOMATIC & DYNAMIC)
        billing_customer_name: pickupAddress.fullName,
        billing_last_name: "",
        billing_address: pickupAddress.addressLine1,
        billing_address_2: pickupAddress.addressLine2 || "",
        billing_city: pickupAddress.city,
        billing_pincode: pickupAddress.pincode,
        billing_state: pickupAddress.state,
        billing_country: "India",
        billing_email: seller.email,
        billing_phone: pickupAddress.mobile,
        
        // ✅ DELIVERY ADDRESS (Buyer's Address - AUTOMATIC)
        shipping_is_billing: false,  // Different pickup and delivery addresses
        shipping_customer_name: deliveryAddress.fullName,
        shipping_last_name: "",
        shipping_address: deliveryAddress.addressLine1,
        shipping_address_2: deliveryAddress.addressLine2 || "",
        shipping_city: deliveryAddress.city,
        shipping_pincode: deliveryAddress.pincode,
        shipping_state: deliveryAddress.state,
        shipping_country: "India",
        shipping_email: order.buyer?.email || "",
        shipping_phone: deliveryAddress.mobile,
        
        // Order Details
        order_items: orderItems,
        payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: order.totalAmount,
        
        // Package dimensions (standard for books)
        length: 20,    // cm
        breadth: 15,   // cm
        height: 5,     // cm
        weight: totalWeight  // kg
      };

      console.log('📦 Creating Shiprocket P2P order...');
      console.log('📍 Dynamic Pickup Location:', dynamicPickupLocation);
      console.log('📍 Pickup from:', pickupAddress.city, pickupAddress.pincode);
      console.log('📍 Delivery to:', deliveryAddress.city, deliveryAddress.pincode);
      console.log('👤 Seller ID:', seller._id.toString().slice(-4));

      const response = await axios.post(
        `${this.baseURL}/orders/create/adhoc`,
        shiprocketOrderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Shiprocket P2P order created successfully');
      console.log('Order ID:', response.data.order_id);
      console.log('Shipment ID:', response.data.shipment_id);
      console.log('Pickup Location:', dynamicPickupLocation);

      return response.data;

    } catch (error) {
      console.error('❌ Shiprocket create order error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.errors || 
        error.message || 
        'Failed to create Shiprocket order'
      );
    }
  }

  // Get Available Couriers for Serviceability Check
  async getAvailableCouriers(pickupPincode, deliveryPincode, weight, isCOD, orderValue) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${this.baseURL}/courier/serviceability/`,
        {
          params: {
            pickup_postcode: pickupPincode,
            delivery_postcode: deliveryPincode,
            weight: weight,
            cod: isCOD ? 1 : 0,
            declared_value: orderValue
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const couriers = response.data.data?.available_courier_companies || [];
      
      if (couriers.length === 0) {
        console.log('⚠️ No couriers available for this route');
      } else {
        console.log(`✅ Found ${couriers.length} available couriers`);
      }

      return couriers;

    } catch (error) {
      console.error('❌ Shiprocket courier check error:', error.response?.data || error.message);
      throw new Error('Failed to fetch available couriers');
    }
  }

  // Assign Courier & Generate AWB
  async assignCourierAndGenerateAWB(shipmentId, courierId) {
    try {
      const token = await this.getToken();

      console.log('📋 Generating AWB for shipment:', shipmentId);

      const response = await axios.post(
        `${this.baseURL}/courier/assign/awb`,
        {
          shipment_id: shipmentId,
          courier_id: courierId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ AWB generated:', response.data.response?.data?.awb_code);

      return response.data;

    } catch (error) {
      console.error('❌ Shiprocket AWB generation error:', error.response?.data || error.message);
      throw new Error('Failed to generate AWB');
    }
  }

  // Schedule Pickup
  async schedulePickup(shipmentIds, pickupDate) {
    try {
      const token = await this.getToken();

      console.log('🚚 Scheduling pickup for:', shipmentIds);

      const response = await axios.post(
        `${this.baseURL}/courier/generate/pickup`,
        {
          shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds],
          pickup_date: pickupDate  // Format: YYYY-MM-DD
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Pickup scheduled successfully');

      return response.data;

    } catch (error) {
      console.error('❌ Shiprocket pickup scheduling error:', error.response?.data || error.message);
      throw new Error('Failed to schedule pickup');
    }
  }

  // Track Shipment
  async trackShipment(shipmentId) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${this.baseURL}/courier/track/shipment/${shipmentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('❌ Shiprocket tracking error:', error.response?.data || error.message);
      throw new Error('Failed to track shipment');
    }
  }

  // Track by AWB Code
  async trackByAWB(awbCode) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${this.baseURL}/courier/track/awb/${awbCode}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('❌ Shiprocket AWB tracking error:', error.response?.data || error.message);
      throw new Error('Failed to track shipment by AWB');
    }
  }

  // Generate Shipping Label
  async generateShippingLabel(shipmentIds) {
    try {
      const token = await this.getToken();

      const response = await axios.post(
        `${this.baseURL}/courier/generate/label`,
        {
          shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Shipping label generated');

      return response.data.label_url;

    } catch (error) {
      console.error('❌ Shiprocket label generation error:', error.response?.data || error.message);
      throw new Error('Failed to generate shipping label');
    }
  }

  // Generate Manifest
  async generateManifest(shipmentIds) {
    try {
      const token = await this.getToken();

      const response = await axios.post(
        `${this.baseURL}/courier/generate/manifest`,
        {
          shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Manifest generated');

      return response.data.manifest_url;

    } catch (error) {
      console.error('❌ Shiprocket manifest generation error:', error.response?.data || error.message);
      throw new Error('Failed to generate manifest');
    }
  }

  // Cancel Shipment
  async cancelShipment(awbCodes) {
    try {
      const token = await this.getToken();

      const response = await axios.post(
        `${this.baseURL}/orders/cancel/shipment/awbs`,
        {
          awbs: Array.isArray(awbCodes) ? awbCodes : [awbCodes]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Shipment cancelled');

      return response.data;

    } catch (error) {
      console.error('❌ Shiprocket cancel error:', error.response?.data || error.message);
      throw new Error('Failed to cancel shipment');
    }
  }

  // Calculate Shipping Rate
  async calculateShippingRate(pickupPincode, deliveryPincode, weight, isCOD, orderValue) {
    try {
      const couriers = await this.getAvailableCouriers(
        pickupPincode,
        deliveryPincode,
        weight,
        isCOD,
        orderValue
      );

      if (!couriers || couriers.length === 0) {
        return {
          available: false,
          message: 'No courier service available for this route'
        };
      }

      // Sort by rate (cheapest first)
      const sortedCouriers = couriers.sort((a, b) => a.rate - b.rate);

      return {
        available: true,
        couriers: sortedCouriers.map(c => ({
          courier_company_id: c.courier_company_id,
          courier_name: c.courier_name,
          rate: c.rate,
          estimated_delivery_days: c.estimated_delivery_days,
          etd: c.etd
        })),
        cheapest: sortedCouriers[0],
        fastest: sortedCouriers.reduce((prev, curr) => 
          prev.estimated_delivery_days < curr.estimated_delivery_days ? prev : curr
        )
      };

    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new ShiprocketService();