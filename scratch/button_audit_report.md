# Reporte de Auditoría de Botones y Clicks

| Archivo | Línea | Elemento | Estado | Vista Previa del Handler |
|---|---|---|---|---|
| pages\staff\PatientDetail.tsx | 488 | `<Button>` | **Alert only** | `() => {                 if (!newPrescription.medic` |
| App.tsx | 394 | `<button>` | **Implemented** | `() => {             localStorage.clear();         ` |
| components\admin\SystemOptionsManager.tsx | 117 | `<button>` | **Implemented** | `() => handleOpenModal(op)` |
| components\admin\SystemOptionsManager.tsx | 124 | `<button>` | **Implemented** | `() => handleToggleActive(op.id, op.activo)` |
| components\admin\SystemOptionsManager.tsx | 164 | `<Button>` | **Implemented** | `() => setIsModalOpen(false)` |
| components\admin\SystemOptionsManager.tsx | 165 | `<Button>` | **Implemented** | `handleSave` |
| components\patient\CheckInModal.tsx | 86 | `<button>` | **Implemented** | `() => setLocalHabits({ ...localHabits, horasSueno:` |
| components\patient\CheckInModal.tsx | 106 | `<button>` | **Implemented** | `() => setLocalHabits({ ...localHabits, nivelDolor:` |
| components\patient\CheckInModal.tsx | 125 | `<button>` | **Implemented** | `() => setLocalHabits({ ...localHabits, nivelEnergi` |
| components\patient\CheckInModal.tsx | 144 | `<button>` | **Implemented** | `() => setLocalHabits({ ...localHabits, digestion: ` |
| components\patient\CheckInModal.tsx | 196 | `<Button>` | **Implemented** | `onClose` |
| components\patient\CheckInModal.tsx | 197 | `<Button>` | **Implemented** | `handleSave` |
| components\patient\NotificationOnboarding.tsx | 80 | `<Button>` | **Implemented** | `handleEnable` |
| components\patient\NotificationOnboarding.tsx | 89 | `<button>` | **Implemented** | `handleSkip` |
| components\recipes\FiltrosAvanzados.tsx | 40 | `<button>` | **Implemented** | `() => setLocal(prev => ({                   ...pre` |
| components\recipes\FiltrosAvanzados.tsx | 63 | `<button>` | **Implemented** | `() => setLocal(prev => ({                   ...pre` |
| components\recipes\FiltrosAvanzados.tsx | 112 | `<button>` | **Implemented** | `() => setLocal(prev => ({                   ...pre` |
| components\recipes\FiltrosAvanzados.tsx | 137 | `<button>` | **Implemented** | `() => {                     const current = local.` |
| components\recipes\FiltrosAvanzados.tsx | 168 | `<button>` | **Implemented** | `() => {                     const current = local.` |
| components\recipes\FiltrosAvanzados.tsx | 197 | `<button>` | **Implemented** | `() => setLocal(prev => ({                   ...pre` |
| components\recipes\FiltrosAvanzados.tsx | 220 | `<button>` | **Implemented** | `() => setLocal(prev => ({                   ...pre` |
| components\recipes\FiltrosAvanzados.tsx | 240 | `<Button>` | **Implemented** | `handleClear` |
| components\recipes\FiltrosAvanzados.tsx | 243 | `<Button>` | **Implemented** | `handleApply` |
| components\recipes\RecetaCard.tsx | 16 | `<div>` | **Implemented** | `onSelect` |
| components\recipes\RecetaCard.tsx | 62 | `<button>` | **Implemented** | `(e) => { e.stopPropagation(); onToggleFav();` |
| components\recipes\RecetaDetalle.tsx | 29 | `<button>` | **Implemented** | `onClose` |
| components\recipes\RecetaDetalle.tsx | 51 | `<button>` | **Implemented** | `onToggleFav` |
| components\recipes\RecetaDetalle.tsx | 203 | `<button>` | **Implemented** | `() => onRate(star)` |
| components\ui\AlertBanner.tsx | 67 | `<button>` | **Implemented** | `() => {             setIsVisible(false);          ` |
| components\ui\Card.tsx | 25 | `<div>` | **Implemented** | `onClick` |
| components\ui\DataTable.tsx | 175 | `<button>` | **Implemented** | `() => setCurrentPage(p => Math.max(1, p - 1))` |
| components\ui\DataTable.tsx | 185 | `<button>` | **Implemented** | `() => setCurrentPage(p => Math.min(totalPages, p +` |
| components\ui\HydrationCard.tsx | 81 | `<button>` | **Implemented** | `onAddWater` |
| components\ui\HydrationCard.tsx | 103 | `<button>` | **Implemented** | `onRemoveWater` |
| components\ui\Modal.tsx | 29 | `<div>` | **Implemented** | `onClose` |
| components\ui\Modal.tsx | 38 | `<button>` | **Implemented** | `onClose` |
| components\ui\SearchBar.tsx | 33 | `<button>` | **Implemented** | `() => onChange('')` |
| components\ui\Tabs.tsx | 29 | `<button>` | **Implemented** | `() => onChange(tab.id)` |
| components\ui\Tabs.tsx | 64 | `<button>` | **Implemented** | `() => onChange(tab.id)` |
| components\wizard\StepClinico.tsx | 45 | `<button>` | **Implemented** | `() => handleToggle(opcion.valor as CondicionMedica` |
| components\wizard\StepClinico.tsx | 74 | `<button>` | **Implemented** | `handleNinguno` |
| components\wizard\StepFarmacos.tsx | 40 | `<button>` | **Implemented** | `() => onToggleArray('medicamentos', opcion.valor)` |
| components\wizard\StepFarmacos.tsx | 83 | `<button>` | **Implemented** | `() => onToggleArray('alergias', opcion.valor)` |
| components\wizard\StepFarmacos.tsx | 112 | `<button>` | **Implemented** | `() => onToggleArray('restriccionesFisicas', opcion` |
| components\wizard\StepObjetivo.tsx | 48 | `<button>` | **Implemented** | `() => onUpdate('objetivo', opcion.valor)` |
| components\wizard\StepObjetivo.tsx | 96 | `<button>` | **Implemented** | `() => onUpdate('nivelActividad', nivel)` |
| components\wizard\StepPersonal.tsx | 132 | `<button>` | **Implemented** | `() => onUpdate('sexo', value)` |
| layouts\AppLayout.tsx | 36 | `<button>` | **Implemented** | `() => navigate(path)` |
| layouts\PatientLayout.tsx | 58 | `<button>` | **Implemented** | `() => navigate(path)` |
| layouts\PatientLayout.tsx | 86 | `<button>` | **Implemented** | `handleLogout` |
| layouts\StaffLayout.tsx | 90 | `<button>` | **Implemented** | `() => navigate(path)` |
| layouts\StaffLayout.tsx | 127 | `<button>` | **Implemented** | `() => setSidebarCollapsed(!sidebarCollapsed)` |
| layouts\StaffLayout.tsx | 137 | `<button>` | **Implemented** | `handleLogout` |
| layouts\StaffLayout.tsx | 151 | `<button>` | **Implemented** | `handleLogout` |
| layouts\StaffLayout.tsx | 166 | `<div>` | **Implemented** | `() => setMobileMenuOpen(false)` |
| layouts\StaffLayout.tsx | 178 | `<button>` | **Implemented** | `() => setMobileMenuOpen(false)` |
| layouts\StaffLayout.tsx | 186 | `<button>` | **Implemented** | `() => { navigate(path); setMobileMenuOpen(false);` |
| layouts\StaffLayout.tsx | 199 | `<button>` | **Implemented** | `() => { navigate('/staff/admin/diccionarios'); set` |
| layouts\StaffLayout.tsx | 206 | `<button>` | **Implemented** | `() => { navigate('/staff/contenido'); setMobileMen` |
| layouts\StaffLayout.tsx | 213 | `<button>` | **Implemented** | `() => { navigate('/staff/admin/personal'); setMobi` |
| layouts\StaffLayout.tsx | 231 | `<button>` | **Implemented** | `handleLogout` |
| layouts\StaffLayout.tsx | 250 | `<button>` | **Implemented** | `() => setMobileMenuOpen(true)` |
| pages\Auth.tsx | 125 | `<button>` | **Implemented** | `() => setShowPassword(!showPassword)` |
| pages\Dashboard.tsx | 178 | `<button>` | **Implemented** | `() => handlePrescriptionTake(p.id)` |
| pages\Dashboard.tsx | 219 | `<button>` | **Implemented** | `() => setIsCheckInOpen(true)` |
| pages\Menu.tsx | 150 | `<button>` | **Implemented** | `onToggle` |
| pages\Menu.tsx | 365 | `<button>` | **Implemented** | `handleOpenModal` |
| pages\Menu.tsx | 386 | `<button>` | **Implemented** | `handleSpeak` |
| pages\Menu.tsx | 413 | `<button>` | **Implemented** | `() => {             const catMap: Record<string, s` |
| pages\Menu.tsx | 443 | `<div>` | **Implemented** | `() => handleToggleRacion(racion.smae_id)` |
| pages\Menu.tsx | 460 | `<Button>` | **Implemented** | `handleSelectAll` |
| pages\Menu.tsx | 463 | `<Button>` | **Implemented** | `handleSaveMeal` |
| pages\Menu.tsx | 525 | `<button>` | **Implemented** | `handlePrevDay` |
| pages\Menu.tsx | 534 | `<button>` | **Implemented** | `handleNextDay` |
| pages\Onboarding.tsx | 225 | `<Button>` | **Implemented** | `() => setStep(step - 1)` |
| pages\Onboarding.tsx | 234 | `<Button>` | **Implemented** | `handleNext` |
| pages\Perfil.tsx | 227 | `<Button>` | **Implemented** | `handleLogout` |
| pages\Recetas.tsx | 130 | `<button>` | **Implemented** | `() => setSearchText('')` |
| pages\Recetas.tsx | 138 | `<button>` | **Implemented** | `() => setShowFiltrosAvanzados(true)` |
| pages\Recetas.tsx | 157 | `<button>` | **Implemented** | `() => setCategoriaActiva(categoriaActiva === cat.v` |
| pages\Recetas.tsx | 169 | `<button>` | **Implemented** | `() => {             setFiltros(prev => ({ ...prev,` |
| pages\Recetas.tsx | 191 | `<button>` | **Implemented** | `() => { setSearchText(''); setCategoriaActiva(null` |
| pages\Recetas.tsx | 223 | `<button>` | **Implemented** | `() => setShowRecomendadas(!showRecomendadas)` |
| pages\Recetas.tsx | 265 | `<button>` | **Implemented** | `() => { setCategoriaActiva(cat.value); window.scro` |
| pages\staff\admin\ContentManagement.tsx | 136 | `<Button>` | **Implemented** | `onClose` |
| pages\staff\admin\ContentManagement.tsx | 293 | `<button>` | **Implemented** | `() => handleToggleStatus(item)` |
| pages\staff\admin\ContentManagement.tsx | 302 | `<button>` | **Implemented** | `() => { setEditingContent(item); setIsModalOpen(tr` |
| pages\staff\admin\ContentManagement.tsx | 308 | `<button>` | **Implemented** | `() => handleDelete(item.id)` |
| pages\staff\admin\NotificationSettings.tsx | 179 | `<Button>` | **Implemented** | `handleAdd` |
| pages\staff\admin\NotificationSettings.tsx | 206 | `<button>` | **Implemented** | `() => handleToggle(schedule.id, schedule.is_active` |
| pages\staff\admin\NotificationSettings.tsx | 213 | `<button>` | **Implemented** | `() => handleDelete(schedule.id)` |
| pages\staff\admin\StaffManagement.tsx | 124 | `<Button>` | **Implemented** | `onClose` |
| pages\staff\admin\StaffManagement.tsx | 295 | `<button>` | **Implemented** | `() => { setEditingStaff(staff); setIsModalOpen(tru` |
| pages\staff\admin\StaffManagement.tsx | 301 | `<button>` | **Implemented** | `() => handleToggleStatus(staff.id)` |
| pages\staff\admin\SystemOptionsManagement.tsx | 120 | `<Button>` | **Implemented** | `() => handleOpenModal()` |
| pages\staff\admin\SystemOptionsManagement.tsx | 129 | `<button>` | **Implemented** | `() => setActiveTab(cat.id)` |
| pages\staff\admin\SystemOptionsManagement.tsx | 161 | `<Button>` | **Implemented** | `fetchAllOptions` |
| pages\staff\admin\SystemOptionsManagement.tsx | 209 | `<button>` | **Implemented** | `() => handleOpenModal(opt)` |
| pages\staff\admin\SystemOptionsManagement.tsx | 216 | `<button>` | **Implemented** | `() => handleDelete(opt.id)` |
| pages\staff\admin\SystemOptionsManagement.tsx | 242 | `<button>` | **Implemented** | `() => setIsModalOpen(false)` |
| pages\staff\admin\SystemOptionsManagement.tsx | 280 | `<Button>` | **Implemented** | `() => setIsModalOpen(false)` |
| pages\staff\PatientCreate.tsx | 142 | `<button>` | **Implemented** | `() => navigate('/staff/pacientes')` |
| pages\staff\PatientCreate.tsx | 249 | `<Button>` | **Implemented** | `() => {             if (step > 1) {               ` |
| pages\staff\PatientCreate.tsx | 263 | `<Button>` | **Implemented** | `handleNext` |
| pages\staff\PatientDetail.tsx | 44 | `<button>` | **Implemented** | `() => navigate('/staff/pacientes')` |
| pages\staff\PatientDetail.tsx | 53 | `<Button>` | **Implemented** | `() => navigate('/staff/pacientes')` |
| pages\staff\PatientDetail.tsx | 111 | `<button>` | **Implemented** | `() => navigate('/staff/pacientes')` |
| pages\staff\PatientDetail.tsx | 153 | `<Button>` | **Implemented** | `() => navigate(`/staff/pacientes/${patient.id` |
| pages\staff\PatientDetail.tsx | 266 | `<Button>` | **Implemented** | `() => setIsModalOpen(true)` |
| pages\staff\PatientDetail.tsx | 401 | `<Button>` | **Implemented** | `() => setShowReport(true)` |
| pages\staff\PatientDetail.tsx | 438 | `<button>` | **Implemented** | `() => setIsModalOpen(false)` |
| pages\staff\PatientDetail.tsx | 487 | `<Button>` | **Implemented** | `() => setIsModalOpen(false)` |
| pages\staff\PatientDetail.tsx | 510 | `<button>` | **Implemented** | `() => setShowReport(false)` |
| pages\staff\PatientDetail.tsx | 543 | `<Button>` | **Implemented** | `() => setShowReport(false)` |
| pages\staff\PatientEvaluate.tsx | 69 | `<button>` | **Implemented** | `() => navigate('/staff/pacientes')` |
| pages\staff\PatientEvaluate.tsx | 78 | `<Button>` | **Implemented** | `() => navigate('/staff/pacientes')` |
| pages\staff\PatientEvaluate.tsx | 153 | `<button>` | **Implemented** | `() => navigate(`/staff/pacientes/${patient.id` |
| pages\staff\PatientEvaluate.tsx | 262 | `<button>` | **Implemented** | `() => updateField('objetivo', obj.valor)` |
| pages\staff\PatientEvaluate.tsx | 312 | `<Button>` | **Implemented** | `() => navigate(`/staff/pacientes/${patient.id` |
| pages\staff\PatientEvaluate.tsx | 319 | `<Button>` | **Implemented** | `handleSubmit` |
| pages\staff\PatientList.tsx | 101 | `<div>` | **Implemented** | `(e) => e.stopPropagation()` |
| pages\staff\PatientList.tsx | 102 | `<button>` | **Implemented** | `() => navigate(`/staff/pacientes/${patient.id` |
| pages\staff\PatientList.tsx | 109 | `<button>` | **Implemented** | `() => navigate(`/staff/pacientes/${patient.id` |
| pages\staff\PatientList.tsx | 145 | `<Button>` | **Implemented** | `() => navigate('/staff/pacientes/nuevo')` |
| pages\staff\PatientList.tsx | 172 | `<Button>` | **Implemented** | `() => navigate('/staff/pacientes/nuevo')` |
| pages\staff\RecipeCreate.tsx | 63 | `<button>` | **Implemented** | `() => navigate(-1)` |
| pages\staff\RecipeCreate.tsx | 135 | `<Button>` | **Implemented** | `() => navigate(-1)` |
| pages\staff\RecipeList.tsx | 83 | `<Button>` | **Implemented** | `() => navigate('/staff/recetas/nueva')` |
| pages\staff\RecipeList.tsx | 98 | `<button>` | **Implemented** | `() => setSearchText('')` |
| pages\staff\RecipeList.tsx | 106 | `<button>` | **Implemented** | `() => setShowFiltrosAvanzados(true)` |
| pages\staff\RecipeList.tsx | 132 | `<button>` | **Implemented** | `() => { setSearchText(''); setFiltros({` |
| pages\staff\StaffDashboard.tsx | 60 | `<Button>` | **Implemented** | `() => navigate('/staff/pacientes/nuevo')` |
| pages\staff\StaffDashboard.tsx | 108 | `<button>` | **Implemented** | `() => navigate('/staff/pacientes')` |
| pages\staff\StaffDashboard.tsx | 121 | `<Button>` | **Implemented** | `() => navigate('/staff/pacientes/nuevo')` |
| pages\staff\StaffDashboard.tsx | 129 | `<button>` | **Implemented** | `() => navigate(`/staff/pacientes/${patient.id` |
| pages\staff\StaffDashboard.tsx | 167 | `<button>` | **Implemented** | `() => navigate('/staff/pacientes/nuevo')` |
| pages\staff\StaffDashboard.tsx | 181 | `<button>` | **Implemented** | `() => navigate('/staff/pacientes')` |
