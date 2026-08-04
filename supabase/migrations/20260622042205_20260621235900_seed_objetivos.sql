-- Insert default system options for "objetivo"
INSERT INTO system_options (categoria, valor, icono, activo)
VALUES
  ('objetivo', 'Perder peso', NULL, true),
  ('objetivo', 'Mantener peso', NULL, true),
  ('objetivo', 'Ganar masa muscular', NULL, true);

-- Insert default system options for "condicion" just in case they are missing
INSERT INTO system_options (categoria, valor, icono, activo)
VALUES
  ('condicion', 'Diabetes (Cualquier tipo)', '🩸', true),
  ('condicion', 'Hipertensión', '🫀', true),
  ('condicion', 'Dislipidemia / Colesterol', '🩸', true),
  ('condicion', 'SOP (Ovarios Poliquísticos)', '♀️', true);
