-- Seed data with dates relative to the current day for dashboard stats

INSERT INTO appointments (client_id, vehicle_id, service_id, assigned_to, appointment_date, appointment_time, estimated_duration, status, priority, description, customer_notes, internal_notes, reminder_sent) VALUES
(1, 1, 1, 3, date('now'), '09:00', 30, 'scheduled', 'normal', 'Today oil change', 'Regular customer', 'Morning slot', 0),
(2, 3, 3, 4, date('now'), '11:30', 90, 'confirmed', 'normal', 'Today brake inspection', 'Squealing noise', 'Check front pads', 0),
(4, 9, 2, 3, date('now', '+1 day'), '10:00', 30, 'scheduled', 'normal', 'Tomorrow synthetic oil change', 'Punctual customer', '', 0),
(5, 10, 5, 4, date('now', '+2 days'), '14:00', 60, 'scheduled', 'high', 'Engine diagnostic', 'Check engine light on', '', 0),
(6, 11, 1, 3, date('now', '+3 days'), '08:30', 30, 'scheduled', 'normal', 'Oil change service', 'Senior discount', '', 0);

INSERT INTO invoices (client_id, work_order_id, invoice_number, invoice_date, due_date, status, subtotal, tax_rate, tax_amount, total_amount, paid_amount, balance_due, payment_terms, notes) VALUES
(1, 1, 'INV-CURRENT-001', date('now', '-10 days'), date('now', '+20 days'), 'paid', 35.49, 0.0825, 2.93, 38.42, 38.42, 0.00, 30, 'Recent oil change'),
(2, 2, 'INV-CURRENT-002', date('now', '-5 days'), date('now', '+25 days'), 'paid', 197.49, 0.0825, 16.29, 213.78, 213.78, 0.00, 30, 'Recent brake service'),
(3, 3, 'INV-CURRENT-003', date('now', '-2 days'), date('now', '+28 days'), 'paid', 17.50, 0.0825, 1.44, 18.94, 18.94, 0.00, 30, 'Recent inspection'),
(4, 4, 'INV-CURRENT-004', date('now', '-1 days'), date('now', '+29 days'), 'sent', 42.99, 0.0825, 3.55, 46.54, 0.00, 46.54, 30, 'Pending payment');

INSERT INTO payments (client_id, invoice_id, payment_method, reference_number, amount, payment_date, notes, created_by)
SELECT 1, id, 'credit_card', 'CC-RECENT-001', 38.42, date('now', '-10 days'), 'Recent payment', 1
FROM invoices WHERE invoice_number = 'INV-CURRENT-001';

INSERT INTO payments (client_id, invoice_id, payment_method, reference_number, amount, payment_date, notes, created_by)
SELECT 2, id, 'check', 'CHK-RECENT-002', 213.78, date('now', '-5 days'), 'Recent payment', 1
FROM invoices WHERE invoice_number = 'INV-CURRENT-002';

INSERT INTO payments (client_id, invoice_id, payment_method, reference_number, amount, payment_date, notes, created_by)
SELECT 3, id, 'cash', NULL, 18.94, date('now', '-2 days'), 'Recent payment', 1
FROM invoices WHERE invoice_number = 'INV-CURRENT-003';
