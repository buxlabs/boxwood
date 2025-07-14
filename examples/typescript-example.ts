// Example of using boxwood with TypeScript
import { Div, H1, Button, Form, Input, component, classes } from 'boxwood';

// Define typed component props
interface UserCardProps {
  name: string;
  email: string;
  isActive: boolean;
}

// Create a typed component
const UserCard = component<UserCardProps>(
  ({ name, email, isActive }, children) => {
    return Div({ 
      className: classes('user-card', { active: isActive }) 
    }, [
      H1({}, name),
      Div({ className: 'email' }, email),
      children
    ]);
  }
);

// Use the component with type checking
const app = Div({ id: 'app' }, [
  UserCard({ 
    name: 'John Doe',
    email: 'john@example.com',
    isActive: true
  }, 
    Button({ onclick: () => alert('Hello!') }, 'Click me')
  ),
  
  Form({ method: 'post' }, [
    Input({ 
      type: 'email',
      name: 'email',
      required: true,
      placeholder: 'Enter email'
    }),
    Button({ type: 'submit' }, 'Submit')
  ])
]);

// TypeScript will provide:
// - Autocomplete for all element attributes
// - Type checking for attribute values
// - Error highlighting for invalid props
// - IntelliSense documentation