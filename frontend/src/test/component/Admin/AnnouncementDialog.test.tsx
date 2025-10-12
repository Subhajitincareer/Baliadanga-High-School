// src/test/component/Admin/AnnouncementDialog.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnnouncementDialog } from '@/components/admin/AnnouncementDialog';
import type { Announcement } from '@/components/admin/AnnouncementForm';

// Mock AnnouncementForm
vi.mock('@/components/admin/AnnouncementForm', () => ({
  default: ({ announcement, onCancel, onSuccess }: any) => (
    <div data-testid="announcement-form">
      <span data-testid="form-mode">
        {announcement ? 'edit' : 'create'}
      </span>
      <button onClick={onSuccess} data-testid="submit-btn">Submit</button>
      <button onClick={onCancel} data-testid="cancel-btn">Cancel</button>
    </div>
  ),
}));

describe('AnnouncementDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  // ✅ Complete mock announcement with all required fields
  const mockAnnouncement: Announcement = {
    id: '1',
    title: 'Test Announcement',
    content: 'Test Content',
    priority: 'High',
    category: 'General',
    targetAudience: 'All',
    publishDate: new Date().toISOString(),
    authorId: 'user-123',
    authorName: 'Test Author',
    createdAt: new Date().toISOString(),
  };

  const defaultProps = {
    isOpen: true,
    onOpenChange: mockOnOpenChange,
    selectedAnnouncement: null as Announcement | null,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', async () => {
    render(<AnnouncementDialog {...defaultProps} />);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('should show Create title for new announcement', async () => {
    render(<AnnouncementDialog {...defaultProps} />);

    const title = await screen.findByText(/create announcement/i);
    expect(title).toBeInTheDocument();
  });

  it('should show Edit title when editing', async () => {
    render(
      <AnnouncementDialog 
        {...defaultProps} 
        selectedAnnouncement={mockAnnouncement} 
      />
    );

    const title = await screen.findByText(/edit announcement/i);
    expect(title).toBeInTheDocument();
  });

  it('should call onSuccess when form is submitted', async () => {
    const user = userEvent.setup();
    render(<AnnouncementDialog {...defaultProps} />);

    const submitBtn = await screen.findByTestId('submit-btn');
    await user.click(submitBtn);

    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('should close dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<AnnouncementDialog {...defaultProps} />);

    const cancelBtn = await screen.findByTestId('cancel-btn');
    await user.click(cancelBtn);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should not render when isOpen is false', () => {
    render(<AnnouncementDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should pass complete announcement to form', async () => {
    render(
      <AnnouncementDialog 
        {...defaultProps} 
        selectedAnnouncement={mockAnnouncement} 
      />
    );

    const formMode = await screen.findByTestId('form-mode');
    expect(formMode).toHaveTextContent('edit');
  });
});
