import { useEffect, useMemo, useState } from "react";

const formatCurrency = (amountPaise, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency
  }).format((amountPaise || 0) / 100);
};

const formatLimit = (value, label) => {
  if (value === null || value === undefined) {
    return `Unlimited ${label}`;
  }

  return `${value} ${label}`;
};

const SubscriptionModal = ({
  open,
  onClose,
  onUpgrade,
  plans = [],
  currentPlan,
  resource,
  loading
}) => {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]?.code || "basic");

  useEffect(() => {
    if (plans.length > 0) {
      setSelectedPlan(plans[0].code);
    }
  }, [plans]);

  const selectedPlanDetails = useMemo(
    () => plans.find((plan) => plan.code === selectedPlan),
    [plans, selectedPlan]
  );

  if (!open) {
    return null;
  }

  return (
    <div className="subscription-modal-overlay" onClick={onClose}>
      <div className="subscription-modal" onClick={(event) => event.stopPropagation()}>
        <div className="subscription-modal-header">
          <h2>Upgrade your shop plan</h2>
          <button className="close-btn" type="button" onClick={onClose}>
            x
          </button>
        </div>
        <p className="muted">
          Your Free plan limit for <strong>{resource || "items"}</strong> is reached. Upgrade to continue
          adding more.
        </p>
        <div className="subscription-plan-grid">
          {plans.map((plan) => {
            const isActiveChoice = plan.code === selectedPlan;
            return (
              <button
                key={plan.code}
                type="button"
                className={`subscription-plan-card ${isActiveChoice ? "selected" : ""}`}
                onClick={() => setSelectedPlan(plan.code)}
              >
                <div className="subscription-plan-top">
                  <span className="subscription-plan-name">{plan.name}</span>
                  <span className="subscription-plan-price">
                    {formatCurrency(plan.amountPaise, plan.currency)}
                  </span>
                </div>
                <div className="muted">{formatLimit(plan.limits?.shops, "shops")}</div>
                <div className="muted">{formatLimit(plan.limits?.products, "products")}</div>
              </button>
            );
          })}
        </div>
        <div className="subscription-modal-footer">
          <div className="muted">Current plan: {currentPlan || "free"}</div>
          <button
            className="primary-btn"
            type="button"
            disabled={!selectedPlanDetails || loading}
            onClick={() => onUpgrade(selectedPlan)}
          >
            {loading ? "Processing..." : `Pay ${formatCurrency(selectedPlanDetails?.amountPaise, selectedPlanDetails?.currency)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
