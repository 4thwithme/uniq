const rule = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Require custom functions to use single object parameter',
			category: 'Best Practices',
		},
		schema: [],
		messages: {
			requireObjectParam:
				'Custom functions must use a single object destructuring parameter',
		},
	},
	create(context) {
		const lifecycleHooks = [
			'onModuleInit',
			'onApplicationBootstrap',
			'onModuleDestroy',
			'onApplicationShutdown',
			'configure',
			'use',
			'catch',
			'intercept',
			'canActivate',
			'validate',
			'transform',
			'run',
		];

		const testingCallbacks = [
			'it',
			'test',
			'describe',
			'beforeEach',
			'afterEach',
			'beforeAll',
			'afterAll',
		];

		const nestjsDecorators = [
			'Get',
			'Post',
			'Put',
			'Delete',
			'Patch',
			'Options',
			'Head',
			'All',
			'UseGuards',
			'UseInterceptors',
			'UsePipes',
			'SetMetadata',
			'Option',
			'CronJobExecution',
			'Query',
			'Mutation',
			'Subscription',
			'ResolveField',
			'ResolveReference',
		];

		const explicitSkipFunctions = ['transform', 'handleMessage'];

		function hasNestJSDecorator(node) {
			const parent = node.parent;
			if (parent?.type === 'MethodDefinition' && parent.decorators) {
				return parent.decorators.some((decorator) => {
					const dec = decorator;
					if (dec.expression.type === 'CallExpression') {
						const callExpr = dec.expression;
						const callee = callExpr.callee;
						if (callee.type === 'Identifier') {
							return nestjsDecorators.includes(callee.name);
						}
					}
					return false;
				});
			}
			return false;
		}

		function isFrameworkMethod(node) {
			const parent = node.parent;

			if (parent?.type === 'MethodDefinition') {
				if (parent.kind === 'constructor') {
					return true;
				}

				const key = parent.key;
				if (key?.type === 'Identifier' && lifecycleHooks.includes(key.name)) {
					return true;
				}

				if (hasNestJSDecorator(node)) {
					return true;
				}
			}

			return false;
		}

		function isTestingCallback(node) {
			const parent = node.parent;

			if (parent?.type === 'CallExpression') {
				const callee = parent.callee;
				if (callee.type === 'Identifier' && testingCallbacks.includes(callee.name)) {
					return true;
				}
			}

			return false;
		}

		function isCallbackFunction(node) {
			const parent = node.parent;

			if (!parent) return false;

			if (isTestingCallback(node)) {
				return true;
			}

			if (parent.type === 'CallExpression' || parent.type === 'NewExpression') {
				const callExpr = parent;
				if (callExpr.arguments.some((arg) => arg === node)) {
					return true;
				}
			}

			if (parent.type === 'ArrayExpression') {
				return true;
			}

			if (
				parent.type === 'JSXExpressionContainer' &&
				parent.parent?.type === 'JSXAttribute'
			) {
				return true;
			}

			if (parent.type === 'Property') {
				const prop = parent;
				if (prop.value === node) {
					const grandParent = prop.parent;
					if (grandParent?.type === 'ObjectExpression') {
						const greatGrandParent = grandParent.parent;
						if (greatGrandParent?.type === 'CallExpression') {
							return true;
						}
					}
				}
			}

			return false;
		}

		function checkFunction(node) {
			if (isCallbackFunction(node) || isFrameworkMethod(node)) {
				return;
			}

			const funcName =
				node.id?.name ??
				(node.parent?.type === 'MethodDefinition' ? node.parent.key?.name : undefined);

			if (funcName && explicitSkipFunctions.includes(funcName)) {
				return;
			}

			const params = node.params;

			if (params.length === 0) {
				return;
			}

			if (params.length === 1 && params[0]?.type === 'RestElement') {
				return;
			}

			if (params.length === 1 && params[0]?.type === 'AssignmentPattern') {
				return;
			}

			const hasValidObjectParam =
				params.length === 1 && params[0]?.type === 'ObjectPattern';

			if (!hasValidObjectParam) {
				context.report({
					node: node,
					messageId: 'requireObjectParam',
				});
			}
		}

		return {
			FunctionDeclaration(node) {
				checkFunction(node);
			},
			FunctionExpression(node) {
				const funcNode = node;
				if (funcNode.parent?.type === 'MethodDefinition') {
					return;
				}
				checkFunction(funcNode);
			},
			ArrowFunctionExpression(node) {
				checkFunction(node);
			},
			MethodDefinition(node) {
				const methodNode = node;
				checkFunction(methodNode.value);
			},
		};
	},
};

module.exports = rule;
