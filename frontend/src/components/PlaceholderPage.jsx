/**
 * Generic placeholder for pages not yet implemented.
 */
export default function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-page__card">
        {Icon && <Icon size={48} className="placeholder-page__icon" />}
        <h2 className="placeholder-page__title">{title}</h2>
        <p className="placeholder-page__desc">{description}</p>
        <span className="placeholder-page__badge">Coming Soon</span>
      </div>
    </div>
  );
}
