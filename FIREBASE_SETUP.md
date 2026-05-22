# Kitch - Firebase Setup Guide

## Project Overview

Kitch is a premium kitchen equipment e-commerce platform built with:
- **Frontend**: React 19 + Vite + TailwindCSS
- **Backend**: Express + tRPC
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Storage**: Firebase Storage

## Firebase Configuration

The project uses the following Firebase project:
- **Project ID**: kitch-ea06f
- **Auth Domain**: kitch-ea06f.firebaseapp.com

### Environment Variables

Create a `.env.local` file in the project root with the following Firebase configuration:

```
VITE_FIREBASE_API_KEY=AIzaSyCR88ybvOtt44VWwVeIyttakN9qcF1Jf5A
VITE_FIREBASE_AUTH_DOMAIN=kitch-ea06f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kitch-ea06f
VITE_FIREBASE_STORAGE_BUCKET=kitch-ea06f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1073404853721
VITE_FIREBASE_APP_ID=1:1073404853721:web:c2f9ebcccf21c6f72c6dc8
VITE_FIREBASE_MEASUREMENT_ID=G-215BKJ37N7
```

## Firestore Collections Structure

### Users Collection (`/users/{userId}`)
```json
{
  "email": "user@example.com",
  "displayName": "John Doe",
  "createdAt": "2024-01-01T00:00:00Z",
  "role": "user"
}
```

### Products Collection (`/products/{productId}`)
```json
{
  "name": "Premium Chef Knife",
  "description": "Professional grade chef knife",
  "price": 99.99,
  "category": "Knives",
  "stock": 50,
  "image": "https://...",
  "featured": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Orders Collection (`/orders/{orderId}`)
```json
{
  "userId": "user-id",
  "items": [
    {
      "productId": "product-id",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "total": 199.98,
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### CMS Content Collection (`/cms_content/{contentId}`)
```json
{
  "key": "homepage_hero",
  "content": "Premium Kitchen Equipment & Solutions",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Testimonials Collection (`/testimonials/{testimonialId}`)
```json
{
  "name": "Sarah Johnson",
  "role": "Professional Chef",
  "text": "Kitch has transformed how I source kitchen equipment.",
  "rating": 5,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Features Collection (`/features/{featureId}`)
```json
{
  "title": "Premium Quality",
  "description": "Handpicked products from leading manufacturers",
  "icon": "zap",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Security Rules

Apply the Firestore security rules from `firestore.rules` to your Firebase project:

1. Go to Firebase Console → Firestore Database → Rules
2. Copy the contents of `firestore.rules`
3. Publish the rules

## Authentication Setup

### Email/Password Authentication
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password"
3. Users can now sign up and log in with email and password

### User Roles
- **user**: Regular customer (default role)
- **admin**: Can manage products, content, and testimonials

To set a user as admin:
1. Go to Firebase Console → Firestore Database
2. Navigate to `/users/{userId}`
3. Change the `role` field to `"admin"`

## Features

### Authentication
- ✅ Email/Password signup
- ✅ Email/Password login
- ✅ Logout functionality
- ✅ Protected routes
- ✅ User profile management

### Products
- ✅ Browse all products
- ✅ Search products
- ✅ View product details
- ✅ Add to cart (frontend only)

### Orders
- ✅ View user orders
- ✅ Order history
- ✅ Order status tracking

### Admin Features
- ✅ Admin dashboard
- ✅ Manage products
- ✅ Manage content
- ✅ View analytics

## Running the Application

### Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173`

### Production Build
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Deployment

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `pnpm build`
5. Deploy: `firebase deploy`

### Custom Server
1. Build the application: `pnpm build`
2. Deploy the `dist` folder to your server
3. Configure your server to serve the SPA

## Troubleshooting

### Firebase Connection Issues
- Verify Firebase credentials in `.env.local`
- Check Firestore security rules
- Ensure Firebase project is active

### Authentication Issues
- Clear browser cache and cookies
- Verify email/password are correct
- Check Firebase Authentication settings

### Database Issues
- Verify Firestore collections exist
- Check security rules allow read/write
- Verify user has appropriate permissions

## Support

For issues or questions, please refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
