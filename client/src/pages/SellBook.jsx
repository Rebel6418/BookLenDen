import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ============================================================
// COMMISSION CONFIG - Jab commission lena ho to yahan change karo
// ============================================================
const COMMISSION_CONFIG = {
  enabled: false,          // true karo jab commission lena ho
  percentage: 10,          // 10% commission (change as needed)
  minAmount: 10,           // Minimum commission in ₹
  maxAmount: 500,          // Maximum commission in ₹
};

const calculateCommission = (price) => {
  if (!COMMISSION_CONFIG.enabled) return 0;
  const commission = (price * COMMISSION_CONFIG.percentage) / 100;
  return Math.min(Math.max(commission, COMMISSION_CONFIG.minAmount), COMMISSION_CONFIG.maxAmount);
};
// ============================================================

// All categories matching Home page
const BOOK_CATEGORIES = [
  {
    name: 'Competitive Exams',
    icon: '🎯',
    subcategories: ['UPSC', 'SSC', 'Banking', 'Railway', 'State PCS', 'NDA', 'Defence', 'Police']
  },
  {
    name: 'Entrance Exams',
    icon: '📝',
    subcategories: ['JEE', 'NEET', 'GATE', 'CAT', 'CUET', 'CLAT', 'NATA', 'NDA Entrance']
  },
  {
    name: 'School Books',
    icon: '🎒',
    subcategories: ['Class 1-5', 'Class 6-8', 'Class 9-10', 'Class 11-12', 'NCERT', 'CBSE', 'ICSE', 'State Board']
  },
  {
    name: 'Engineering',
    icon: '⚙️',
    subcategories: ['Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Electronics', 'Chemical', 'AI/ML']
  },
  {
    name: 'Medical',
    icon: '🩺',
    subcategories: ['MBBS', 'BDS', 'Nursing', 'Pharmacy', 'Physiotherapy', 'AYUSH']
  },
  {
    name: 'College Books',
    icon: '🎓',
    subcategories: ['B.Tech', 'B.Sc', 'B.Com', 'BBA', 'MBA', 'M.Tech', 'MA', 'PhD']
  },
  {
    name: 'Fiction',
    icon: '📖',
    subcategories: ['Novel', 'Romance', 'Thriller', 'Mystery', 'Fantasy', 'Sci-Fi', 'Horror']
  },
  {
    name: 'Non-Fiction',
    icon: '📚',
    subcategories: ['Self Help', 'Business', 'Biography', 'History', 'Psychology', 'Science']
  },
  {
    name: 'Motivational',
    icon: '💡',
    subcategories: ['Personal Development', 'Success Stories', 'Leadership', 'Productivity']
  },
  {
    name: 'Kids Books',
    icon: '🧸',
    subcategories: ['Picture Books', 'Story Books', 'Activity Books', 'Comics']
  },
  {
    name: 'Language',
    icon: '🌐',
    subcategories: ['English', 'Hindi', 'Sanskrit', 'Regional Languages', 'Foreign Languages']
  },
  {
    name: 'Arts & Hobbies',
    icon: '🎨',
    subcategories: ['Drawing', 'Music', 'Photography', 'Cooking', 'Sports', 'Travel']
  },
  {
    name: 'Reference',
    icon: '📑',
    subcategories: ['Dictionary', 'Encyclopedia', 'Atlas', 'Yearbooks', 'Current Affairs']
  },
  {
    name: 'Professional',
    icon: '💼',
    subcategories: ['Law', 'CA/CMA/CS', 'Architecture', 'Fashion Design', 'Hospitality']
  }
];

const SellBook = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Category, Step 2: Details
  const [sellerAddressComplete, setSellerAddressComplete] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    condition: 'Old',
    category: '',
    subcategory: '',
    description: '',
    edition: '',
    language: 'Hindi',
    publishYear: ''
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedCategoryObj, setSelectedCategoryObj] = useState(null);

  // Commission calculation
  const commission = calculateCommission(Number(formData.price) || 0);
  const sellerEarns = (Number(formData.price) || 0) - commission;

  // Check seller profile on load
  useEffect(() => {
    checkSellerProfile();
  }, []);

  const checkSellerProfile = async () => {
    try {
      setCheckingProfile(true);
      const res = await api.get('/users/profile');
      const user = res.data.user;
      // Check if seller address is filled
      const hasAddress = user?.sellerAddress?.pincode && user?.sellerAddress?.addressLine1;
      setSellerAddressComplete(hasAddress);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      console.error('Profile check failed');
      setSellerAddressComplete(true); // Allow if can't check
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategoryObj(category);
    setFormData(prev => ({ ...prev, category: category.name, subcategory: '' }));
    setStep(2);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { setError('Please upload a book image'); return; }
    if (!formData.title) { setError('Book title is required'); return; }
    if (!formData.author) { setError('Author name is required'); return; }
    if (!formData.price || formData.price <= 0) { setError('Valid price is required'); return; }
    if (!formData.category) { setError('Please select a category'); return; }

    setIsLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('author', formData.author);
      data.append('price', formData.price);
      data.append('condition', formData.condition);
      data.append('category', formData.category);
      data.append('subcategory', formData.subcategory || '');
      data.append('description', formData.description || '');
      data.append('edition', formData.edition || '');
      data.append('language', formData.language || 'Hindi');
      data.append('publishYear', formData.publishYear || '');
      data.append('image', image);

      const res = await api.post('/books', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list book. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Loading ───────────────────────────────────────────────
  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // ─── Seller Address Missing ─────────────────────────────────
  if (!sellerAddressComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pickup Address Required!</h2>
          <p className="text-gray-600 mb-6">
            Before listing books, please add your pickup address so Shiprocket can collect books from you when orders come in.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-amber-800 mb-2">Why is this needed?</p>
            <p className="text-sm text-amber-700">When a buyer orders your book, Shiprocket's delivery boy will come to your address to pick it up. Your address is completely private and never shown to buyers.</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            📍 Add Pickup Address in Profile
          </button>
          <button
            onClick={() => navigate('/')}
            className="mt-3 w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // ─── Success Screen ─────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Listed Successfully!</h2>
          <p className="text-gray-600 mb-2">
            <strong>{formData.title}</strong> is now live on BookLenDen!
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Buyers can now find and purchase your book.
            You'll receive an email notification when someone orders it.
          </p>
          {COMMISSION_CONFIG.enabled && commission > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-sm">
              <p className="text-blue-700">Listed price: ₹{formData.price}</p>
              <p className="text-blue-700">Platform fee: ₹{commission}</p>
              <p className="text-green-700 font-bold">You'll earn: ₹{sellerEarns}</p>
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={() => { setSuccess(false); setStep(1); setFormData({ title: '', author: '', price: '', condition: 'Old', category: '', subcategory: '', description: '', edition: '', language: 'Hindi', publishYear: '' }); setImage(null); setImagePreview(null); }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold"
            >
              + List Another Book
            </button>
            <button
              onClick={() => navigate('/my-books')}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium"
            >
              View My Listed Books
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📚 Sell Your Book</h1>
          <p className="text-gray-600 mt-2">List your book in minutes and start earning!</p>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${step === 1 ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'}`}>
            {step > 1 ? '✅' : '1'} Category
          </div>
          <div className="h-0.5 w-12 bg-gray-300"></div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            2 Book Details
          </div>
        </div>

        {/* ─── STEP 1: Category Selection ─── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Select Book Category</h2>
            <p className="text-gray-500 text-sm mb-6">Choose the right category to reach the right buyers</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {BOOK_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategorySelect(cat)}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group text-center"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-700">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── STEP 2: Book Details Form ─── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            {/* Back button */}
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-blue-600 font-semibold mb-6 hover:gap-3 transition-all">
              ← Back to Categories
            </button>

            {/* Selected Category */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
              <span className="text-2xl">{selectedCategoryObj?.icon}</span>
              <div>
                <p className="font-bold text-blue-800">{formData.category}</p>
                <p className="text-xs text-blue-600">Selected Category</p>
              </div>
              <button onClick={() => setStep(1)} className="ml-auto text-xs text-blue-600 underline">Change</button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Book Cover Photo * <span className="text-gray-400 font-normal">(Clear photo = more buyers!)</span>
                </label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="book-image" />
                <label htmlFor="book-image" className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-xl p-2" />
                      <button type="button" onClick={(e) => { e.preventDefault(); setImage(null); setImagePreview(null); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600">✕</button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">📸</div>
                      <p className="font-semibold text-gray-600">Click to upload book photo</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Subcategory */}
              {selectedCategoryObj?.subcategories?.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subcategory</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategoryObj.subcategories.map(sub => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, subcategory: sub }))}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${
                          formData.subcategory === sub
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title & Author */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Book Title *</label>
                  <input
                    name="title" value={formData.title} onChange={handleChange}
                    placeholder="e.g., UPSC Civil Services GS Paper 1"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Author *</label>
                  <input
                    name="author" value={formData.author} onChange={handleChange}
                    placeholder="e.g., M. Laxmikanth"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Price, Condition, Edition */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Your Price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                    <input
                      type="number" name="price" value={formData.price} onChange={handleChange}
                      placeholder="299" min="1"
                      className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  {/* Commission Preview (hidden when disabled) */}
                  {COMMISSION_CONFIG.enabled && formData.price > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      Platform fee: ₹{commission} | You earn: ₹{sellerEarns}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Condition *</label>
                  <select name="condition" value={formData.condition} onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors">
                    <option value="Old">📘 Old / Used</option>
                    <option value="New">✨ New / Like New</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Edition</label>
                  <input
                    name="edition" value={formData.edition} onChange={handleChange}
                    placeholder="e.g., 2024, 7th Edition"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Language & Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Language</label>
                  <select name="language" value={formData.language} onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors">
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Bilingual">Bilingual (Hindi + English)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Publish Year</label>
                  <input
                    name="publishYear" value={formData.publishYear} onChange={handleChange}
                    placeholder="e.g., 2024"
                    type="number" min="2000" max="2025"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Description <span className="text-gray-400 font-normal">(Optional - helps buyers decide)</span>
                </label>
                <textarea
                  name="description" value={formData.description} onChange={handleChange}
                  rows="3"
                  placeholder="Describe condition, what's included, any highlights, etc..."
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button" onClick={() => setStep(1)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit" disabled={isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Listing Book...
                    </span>
                  ) : '🚀 List Book Now'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellBook;