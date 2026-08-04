SELECT public.create_patient_user(
  'admin@aviva.com',
  'aviva123',
  'Admin',
  'Aviva',
  '0000000000'
);
UPDATE auth.users SET raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb, raw_user_meta_data = '{}'::jsonb WHERE email = 'admin@aviva.com';
UPDATE public.users SET role = 'admin' WHERE email = 'admin@aviva.com';
