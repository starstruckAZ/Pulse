-- Allow system templates (user_id NULL)
ALTER TABLE response_templates ALTER COLUMN user_id DROP NOT NULL;

-- Add is_system flag
ALTER TABLE response_templates ADD COLUMN IF NOT EXISTS is_system boolean NOT NULL DEFAULT false;

-- Allow anyone to read system templates (RLS)
CREATE POLICY "Anyone can read system templates"
  ON response_templates FOR SELECT
  USING (is_system = true);

-- Seed 10 pre-made system templates
INSERT INTO response_templates (user_id, name, template_text, sentiment_filter, is_system) VALUES

-- Positive templates
(NULL, 'Thank You — 5 Star', 'Hi {reviewer_name}, thank you so much for the wonderful review! We''re thrilled to hear you had a great experience at {business_name}. Your kind words mean a lot to our team. We look forward to welcoming you back soon!', 'positive', true),

(NULL, 'Grateful for the Feedback', 'Hi {reviewer_name}, wow — thank you for the amazing feedback! It''s customers like you that make what we do so rewarding. We''re glad everything met your expectations and can''t wait to see you again!', 'positive', true),

(NULL, 'Appreciate the Recommendation', 'Hi {reviewer_name}, thank you for taking the time to leave such a thoughtful review! We''re so happy you enjoyed your experience at {business_name}. We''d love to have you back anytime — and thanks for spreading the word!', 'positive', true),

-- Negative templates
(NULL, 'Sincere Apology', 'Hi {reviewer_name}, thank you for sharing your experience. I''m sorry to hear things didn''t go as expected at {business_name}. This isn''t the standard we hold ourselves to. Could you reach out to us directly so we can make this right? We value your feedback and want to do better.', 'negative', true),

(NULL, 'Service Recovery', 'Hi {reviewer_name}, we appreciate you bringing this to our attention. We''re genuinely sorry about your experience. We''ve shared your feedback with our team and are taking steps to ensure this doesn''t happen again. We''d love the chance to earn back your trust — please contact us at your convenience.', 'negative', true),

(NULL, 'Wait Time Apology', 'Hi {reviewer_name}, thank you for your patience and for letting us know. We understand how frustrating long wait times can be. We''re actively working to improve our scheduling so that every customer gets the attention they deserve. We hope you''ll give us another chance.', 'negative', true),

-- Neutral templates
(NULL, 'General Thank You', 'Hi {reviewer_name}, thank you for taking the time to share your thoughts about {business_name}. We appreciate all feedback — it helps us continue to improve. If there''s anything we can do to make your next visit even better, please don''t hesitate to let us know!', 'neutral', true),

(NULL, 'Request for More Details', 'Hi {reviewer_name}, thanks for your feedback! We''d love to learn more about your experience so we can continue improving. If you have a moment, could you share more details with us? Your input helps us serve you and our community better.', 'neutral', true),

-- All-purpose templates
(NULL, 'Quick Thank You', 'Thank you for the {rating}-star review, {reviewer_name}! Your feedback means a lot to {business_name}. We appreciate your support and look forward to serving you again.', NULL, true),

(NULL, 'Professional Follow-Up', 'Hi {reviewer_name}, thank you for reviewing {business_name}. We take every review seriously and your feedback helps us grow. If there''s anything more we can do, our team is always happy to help. Thank you for choosing us!', NULL, true);
