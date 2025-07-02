// Test compilation of modular AddTextTool
import { AddTextTool } from '../components/organisms';

// Test component instantiation
const testAddTextTool = () => {
  const mockProps = {
    files: [],
    onComplete: (result: Blob) => console.log('Complete:', result),
    onClose: () => console.log('Close'),
    className: 'test-class'
  };

  // This should compile without errors
  return <AddTextTool {...mockProps} />;
};

export default testAddTextTool;