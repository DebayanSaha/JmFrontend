# Protected Actions System

A comprehensive, reusable authentication system for React applications that prevents access to core features unless users are logged in, while maintaining full UI visibility.

## 🎯 Features

- **Full UI Visibility**: Users can see all buttons and features even when not logged in
- **Smart Authentication**: Automatic login popup when unauthenticated users try to access protected features
- **Multiple Patterns**: Choose from hooks, HOCs, factory functions, or pre-built components
- **TypeScript Ready**: Full type safety and IntelliSense support
- **Error Handling**: Comprehensive error handling with fallbacks
- **Performance Optimized**: Minimal re-renders and efficient state management
- **Accessibility**: ARIA-compliant modals with keyboard navigation
- **Cross-tab Sync**: Authentication state syncs across browser tabs

## 🚀 Quick Start

### 1. Basic Usage with Custom Hook (Recommended)

```jsx
import { useProtectedAction } from './components/VerifiedPopup';

const MyComponent = () => {
  const { handleProtectedAction, handleProtectedAsyncAction, LoginModal } = useProtectedAction();

  const handleDownload = () => {
    // Your download logic here
    console.log('Downloading file...');
  };

  const handleAsyncAction = async () => {
    // Your async logic here
    const result = await fetch('/api/data');
    return result.json();
  };

  return (
    <div>
      <button onClick={() => {
        const result = handleProtectedAction(handleDownload, 'download file');
        if (!result.success && !result.requiresAuth) {
          console.error('Download failed:', result.error);
        }
      }}>
        Download File
      </button>

      <button onClick={async () => {
        const result = await handleProtectedAsyncAction(handleAsyncAction, 'fetch data');
        if (result.success) {
          console.log('Data fetched:', result.result);
        }
      }}>
        Fetch Data
      </button>

      <LoginModal />
    </div>
  );
};
```

### 2. Using Pre-built Components

```jsx
import { 
  ProtectedActionButton, 
  ProtectedAsyncButton,
  ProtectedDownloadButton,
  ProtectedEmailButton 
} from './components/ProtectedButton';

const MyComponent = () => {
  const handleAction = () => console.log('Action executed!');
  const handleAsyncAction = async () => {
    await fetch('/api/data');
    return 'Success!';
  };
  const handleDownload = async (filename) => {
    // Download logic
    return { success: true };
  };
  const handleEmail = async () => {
    // Email logic
    return { success: true };
  };

  return (
    <div>
      <ProtectedActionButton onClick={handleAction} actionName="perform action">
        Click Me
      </ProtectedActionButton>

      <ProtectedAsyncButton onAsyncClick={handleAsyncAction} actionName="async action">
        Async Action
      </ProtectedAsyncButton>

      <ProtectedDownloadButton 
        filename="example.txt" 
        onDownload={handleDownload} 
      />

      <ProtectedEmailButton onSendEmail={handleEmail} />
    </div>
  );
};
```

## 📚 API Reference

### Custom Hook: `useProtectedAction()`

Returns an object with the following properties:

```jsx
const {
  handleProtectedAction,        // Function for sync actions
  handleProtectedAsyncAction,   // Function for async actions
  showLoginModal,              // Function to show login modal
  hideLoginModal,              // Function to hide login modal
  isAuthenticated,             // Boolean authentication status
  LoginModal                   // React component for the modal
} = useProtectedAction();
```

#### `handleProtectedAction(action, actionName?)`

- **action**: Function to execute if authenticated
- **actionName**: Optional string describing the action (for error messages)
- **Returns**: Object with `{ success, requiresAuth, result, error, message }`

#### `handleProtectedAsyncAction(asyncAction, actionName?)`

- **asyncAction**: Async function to execute if authenticated
- **actionName**: Optional string describing the action
- **Returns**: Promise resolving to `{ success, requiresAuth, result, error, message }`

### Factory Functions

#### `createProtectedActionHandler(showLoginModal)`

Creates a protected action handler with custom modal control.

```jsx
const [showModal, setShowModal] = useState(false);
const protectedAction = createProtectedActionHandler(() => setShowModal(true));

const result = protectedAction(() => {
  // Your action here
}, 'action name');
```

#### `createProtectedAsyncActionHandler(showLoginModal)`

Creates a protected async action handler with custom modal control.

```jsx
const protectedAsyncAction = createProtectedAsyncActionHandler(() => setShowModal(true));

const result = await protectedAsyncAction(async () => {
  // Your async action here
}, 'async action name');
```

### Higher-Order Component: `withAuthProtection`

Wraps any component with authentication protection.

```jsx
const ProtectedButton = withAuthProtection(
  ({ children, ...props }) => <button {...props}>{children}</button>,
  'perform this action'
);

<ProtectedButton onClick={handleAction}>Click Me</ProtectedButton>
```

### Pre-built Components

#### `ProtectedActionButton`

```jsx
<ProtectedActionButton 
  onClick={handleAction}
  actionName="perform action"
  disabled={false}
  style={{}}
>
  Click Me
</ProtectedActionButton>
```

#### `ProtectedAsyncButton`

```jsx
<ProtectedAsyncButton 
  onAsyncClick={handleAsyncAction}
  actionName="async action"
  disabled={false}
  loading={false}
  style={{}}
>
  Async Action
</ProtectedAsyncButton>
```

#### `ProtectedDownloadButton`

```jsx
<ProtectedDownloadButton 
  filename="file.txt"
  onDownload={handleDownload}
  disabled={false}
  style={{}}
/>
```

#### `ProtectedEmailButton`

```jsx
<ProtectedEmailButton 
  onSendEmail={handleEmail}
  disabled={false}
  style={{}}
/>
```

### Authentication Utilities

#### `checkAuthentication()`

Returns boolean indicating if user is authenticated.

#### `getAuthToken()`

Returns the current authentication token.

#### `getCurrentUser()`

Returns the current user object.

#### `useAuth()`

Custom hook for authentication state management.

```jsx
const { isAuthenticated, user, updateAuthState } = useAuth();
```

## 🔧 Integration Examples

### 1. Chat Input with Protected Send

```jsx
const ChatInput = () => {
  const [message, setMessage] = useState('');
  const { handleProtectedAction } = useProtectedAction();

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Send message logic
    console.log('Sending:', message);
    setMessage('');
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleProtectedAction(handleSendMessage, 'send message');
          }
        }}
      />
      <button onClick={() => {
        handleProtectedAction(handleSendMessage, 'send message');
      }}>
        Send
      </button>
    </div>
  );
};
```

### 2. File Upload with Protected Submit

```jsx
const FileUpload = () => {
  const [file, setFile] = useState(null);
  const { handleProtectedAsyncAction } = useProtectedAction();

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    return response.json();
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={async () => {
        const result = await handleProtectedAsyncAction(handleUpload, 'upload file');
        if (result.success) {
          console.log('Upload successful:', result.result);
        }
      }}>
        Upload File
      </button>
    </div>
  );
};
```

### 3. Form Submission with Protected Submit

```jsx
const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const { handleProtectedAsyncAction } = useProtectedAction();

  const handleSubmit = async () => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    return response.json();
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleProtectedAsyncAction(handleSubmit, 'submit contact form');
    }}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <textarea
        placeholder="Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
      />
      <button type="submit">Send Message</button>
    </form>
  );
};
```

## 🎨 Customization

### Custom Modal Styling

The `LoginRequiredModal` component can be customized by modifying the styles in `VerifiedPopup.js`:

```jsx
// In VerifiedPopup.js
const LoginRequiredModal = ({ isOpen, onClose, customStyles = {} }) => {
  return (
    <div style={{
      // Default styles
      background: 'linear-gradient(135deg, #FFF8F1 0%, #FFF1E6 100%)',
      borderRadius: '20px',
      padding: '32px',
      // Custom styles override
      ...customStyles
    }}>
      {/* Modal content */}
    </div>
  );
};
```

### Custom Authentication Logic

Override the authentication check by modifying the `checkAuthentication` function:

```jsx
// In VerifiedPopup.js
export const checkAuthentication = () => {
  try {
    // Your custom authentication logic here
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // Add additional checks as needed
    const isTokenValid = validateToken(token);
    const isUserActive = checkUserStatus(user);
    
    return !!(token && user && isTokenValid && isUserActive);
  } catch (error) {
    console.warn('Authentication check failed:', error);
    return false;
  }
};
```

## 🔒 Security Considerations

1. **Token Validation**: Always validate tokens on the server side
2. **HTTPS**: Use HTTPS in production for secure token transmission
3. **Token Expiry**: Implement proper token expiry handling
4. **CSRF Protection**: Use CSRF tokens for sensitive operations
5. **Rate Limiting**: Implement rate limiting on authentication endpoints

## 🚨 Error Handling

The system provides comprehensive error handling:

```jsx
const result = await handleProtectedAsyncAction(async () => {
  // Your async action
}, 'action name');

if (!result.success) {
  if (result.requiresAuth) {
    // User needs to log in - modal is already shown
    console.log('Authentication required');
  } else {
    // Action failed due to other reasons
    console.error('Action failed:', result.error);
    // Show error message to user
    alert(`Action failed: ${result.error}`);
  }
} else {
  // Action successful
  console.log('Action completed:', result.result);
}
```

## 📱 Responsive Design

All components are fully responsive and work on all screen sizes. The modal automatically adapts to mobile devices with touch-friendly interactions.

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support (Escape to close, Tab navigation)
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Automatic focus trapping in modals
- **High Contrast**: Compatible with high contrast themes

## 🔄 State Management

The system integrates with your existing state management:

```jsx
// With Redux
const { handleProtectedAction } = useProtectedAction();
const dispatch = useDispatch();

const handleAction = () => {
  dispatch(someAction());
};

// With Zustand
const { handleProtectedAction } = useProtectedAction();
const { setUser } = useStore();

const handleAction = () => {
  setUser(newUserData);
};
```

## 🧪 Testing

Example test cases for protected actions:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { useProtectedAction } from './VerifiedPopup';

// Mock authentication
jest.mock('./VerifiedPopup', () => ({
  ...jest.requireActual('./VerifiedPopup'),
  checkAuthentication: jest.fn()
}));

test('shows login modal when user is not authenticated', () => {
  checkAuthentication.mockReturnValue(false);
  
  render(<MyComponent />);
  
  fireEvent.click(screen.getByText('Download'));
  
  expect(screen.getByText('Login Required')).toBeInTheDocument();
});

test('executes action when user is authenticated', () => {
  checkAuthentication.mockReturnValue(true);
  
  const mockAction = jest.fn();
  
  render(<MyComponent onAction={mockAction} />);
  
  fireEvent.click(screen.getByText('Download'));
  
  expect(mockAction).toHaveBeenCalled();
});
```

## 📦 Installation

1. Copy the `VerifiedPopup.js` and `ProtectedButton.js` files to your components directory
2. Import and use the utilities as shown in the examples
3. Ensure your authentication system stores tokens in localStorage/sessionStorage
4. Customize the modal styling and authentication logic as needed

## 🤝 Contributing

When contributing to this system:

1. Maintain backward compatibility
2. Add comprehensive error handling
3. Include accessibility features
4. Write tests for new functionality
5. Update documentation

## 📄 License

This system is designed to be easily integrated into any React application. Feel free to modify and extend it according to your needs.

---

**Note**: This system assumes you have a working authentication system that stores tokens in localStorage or sessionStorage. Adjust the authentication logic in `checkAuthentication()` to match your specific authentication implementation. 