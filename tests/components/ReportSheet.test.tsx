import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create, act } from 'react-test-renderer';
import { findByText, findAllByText, queryByText } from './test-utils';

// Mock gameInstance
const mockLogEvent = vi.fn();
vi.mock('../../src/hooks/gameInstance', () => ({
  getGameInstance: () => ({
    storage: { logEvent: mockLogEvent },
    sessionId: 'test-session-123',
  }),
}));

// Mock toast
vi.mock('../../src/components/Toast', () => ({
  toast: vi.fn(),
}));

import { ReportSheet } from '../../src/components/ReportSheet';
import { toast } from '../../src/components/Toast';

describe('ReportSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    const tree = create(<ReportSheet open={false} cardId="test-card" onClose={vi.fn()} />);
    expect(tree.toJSON()).toBeNull();
  });

  it('renders title when open', () => {
    const tree = create(<ReportSheet open={true} cardId="test-card" onClose={vi.fn()} />);
    expect(findByText(tree.root, 'REPORT THIS PLOT')).toBeTruthy();
  });

  it('renders all 7 report reasons', () => {
    const tree = create(<ReportSheet open={true} cardId="test-card" onClose={vi.fn()} />);
    const reasons = [
      'Wrong answer shown',
      'Plot is inaccurate',
      'Card is offensive',
      'Too easy',
      'Too hard',
      'Duplicate card',
      'Other',
    ];
    for (const reason of reasons) {
      expect(findByText(tree.root, reason)).toBeTruthy();
    }
  });

  it('shows toast when submitting without selection', () => {
    const tree = create(<ReportSheet open={true} cardId="test-card" onClose={vi.fn()} />);
    const submitBtn = findByText(tree.root, 'Submit Report');
    act(() => { submitBtn.props.onClick(); });
    expect(toast).toHaveBeenCalledWith('Please select a reason');
  });

  it('calls logEvent and onClose on valid submit', () => {
    const onClose = vi.fn();
    const tree = create(<ReportSheet open={true} cardId="test-card" onClose={onClose} />);

    // Select a reason
    const tag = findByText(tree.root, 'Too easy');
    act(() => { tag.props.onClick(); });

    // Submit
    const submitBtn = findByText(tree.root, 'Submit Report');
    act(() => { submitBtn.props.onClick(); });

    expect(mockLogEvent).toHaveBeenCalledOnce();
    expect(mockLogEvent).toHaveBeenCalledWith(expect.objectContaining({
      event: 'card:report',
      props: expect.objectContaining({
        cardId: 'test-card',
        reason: 'Too easy',
      }),
    }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    const tree = create(<ReportSheet open={true} cardId="test-card" onClose={onClose} />);
    const cancelBtn = findByText(tree.root, 'Cancel');
    act(() => { cancelBtn.props.onClick(); });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
