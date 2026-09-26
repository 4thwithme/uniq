import styles from '@components/StepNav/StepNav.module.scss';

export interface StepNavOption<O extends string> {
	id: O;
	label: string;
	meta?: string | undefined;
}

export interface StepNavStep<S extends string, O extends string> {
	id: S;
	label: string;
	description?: string | undefined;
	options?: readonly StepNavOption<O>[] | undefined;
}

interface StepNavProps<S extends string, O extends string> {
	label: string;
	steps: readonly StepNavStep<S, O>[];
	activeStep: S;
	activeOption?: O | undefined;
	onSelect: (params: { step: S; option?: O | undefined }) => void;
}

export function StepNav<S extends string, O extends string>({
	label,
	steps,
	activeStep,
	activeOption,
	onSelect,
}: StepNavProps<S, O>): React.JSX.Element {
	return (
		<nav className={styles.nav} aria-label={label}>
			<ol className={styles.steps}>
				{steps.map((step, index) => {
					const isActive = step.id === activeStep;
					return (
						<li key={step.id} className={styles.step} data-active={isActive}>
							<button
								type="button"
								className={styles.stepButton}
								aria-current={isActive ? 'step' : undefined}
								onClick={() => {
									onSelect({ step: step.id });
								}}
							>
								<span className={styles.index} aria-hidden="true">
									{String(index + 1).padStart(2, '0')}
								</span>
								<span className={styles.stepText}>
									<span className={styles.stepLabel}>{step.label}</span>
									{step.description === undefined ? null : (
										<span className={styles.stepDescription}>{step.description}</span>
									)}
								</span>
							</button>
							{step.options === undefined || !isActive ? null : (
								<ul className={styles.options} aria-label={`${step.label} options`}>
									{step.options.map((option) => (
										<li key={option.id}>
											<button
												type="button"
												className={styles.option}
												aria-current={option.id === activeOption ? 'true' : undefined}
												onClick={() => {
													onSelect({ step: step.id, option: option.id });
												}}
											>
												{option.label}
												{option.meta === undefined ? null : (
													<span className={styles.optionMeta}>{option.meta}</span>
												)}
											</button>
										</li>
									))}
								</ul>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
