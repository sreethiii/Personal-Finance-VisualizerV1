-- Insert default categories
INSERT INTO categories (name, color) VALUES
('Food & Dining', '#EF4444'),
('Transportation', '#3B82F6'),
('Shopping', '#8B5CF6'),
('Entertainment', '#F59E0B'),
('Bills & Utilities', '#10B981'),
('Healthcare', '#EC4899'),
('Travel', '#06B6D4'),
('Education', '#84CC16'),
('Income', '#22C55E'),
('Other', '#6B7280')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample user (for development)
INSERT INTO users (id, email, name) VALUES
('user_123', 'demo@example.com', 'Demo User')
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- Insert sample transactions
INSERT INTO transactions (id, user_id, amount, date, description, category, type) VALUES
('txn_1', 'user_123', 1200.00, '2024-01-15', 'Salary', 'Income', 'income'),
('txn_2', 'user_123', 45.50, '2024-01-14', 'Grocery shopping', 'Food & Dining', 'expense'),
('txn_3', 'user_123', 25.00, '2024-01-13', 'Gas station', 'Transportation', 'expense'),
('txn_4', 'user_123', 89.99, '2024-01-12', 'Internet bill', 'Bills & Utilities', 'expense'),
('txn_5', 'user_123', 15.75, '2024-01-11', 'Coffee shop', 'Food & Dining', 'expense'),
('txn_6', 'user_123', 120.00, '2024-01-10', 'Clothing', 'Shopping', 'expense'),
('txn_7', 'user_123', 35.00, '2024-01-09', 'Movie tickets', 'Entertainment', 'expense'),
('txn_8', 'user_123', 200.00, '2024-01-08', 'Freelance work', 'Income', 'income')
ON DUPLICATE KEY UPDATE amount = VALUES(amount);

-- Insert sample budgets
INSERT INTO budgets (user_id, category, amount, month) VALUES
('user_123', 'Food & Dining', 300.00, '2024-01'),
('user_123', 'Transportation', 150.00, '2024-01'),
('user_123', 'Entertainment', 100.00, '2024-01'),
('user_123', 'Bills & Utilities', 200.00, '2024-01'),
('user_123', 'Shopping', 250.00, '2024-01')
ON DUPLICATE KEY UPDATE amount = VALUES(amount);
