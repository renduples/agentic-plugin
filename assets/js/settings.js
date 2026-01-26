/**
 * Settings page JavaScript for LLM provider configuration
 */

// LLM Provider configuration
const llmProviders = {
	openai: {
		name: 'OpenAI',
		docs: 'https://platform.openai.com/api-keys',
		models: {
			'gpt-4o': 'GPT-4o (Recommended)',
			'gpt-4o-mini': 'GPT-4o Mini (Faster, cheaper)',
			'gpt-4-turbo': 'GPT-4 Turbo',
			'gpt-4': 'GPT-4',
			'gpt-3.5-turbo': 'GPT-3.5 Turbo'
		},
		default: 'gpt-4o'
	},
	anthropic: {
		name: 'Anthropic',
		docs: 'https://console.anthropic.com/settings/keys',
		models: {
			'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet (Recommended)',
			'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku (Fast)',
			'claude-3-opus-20240229': 'Claude 3 Opus (Most capable)'
		},
		default: 'claude-3-5-sonnet-20241022'
	},
	xai: {
		name: 'xAI',
		docs: 'https://console.x.ai/',
		models: {
			'grok-3': 'Grok 3 (Recommended)',
			'grok-3-fast': 'Grok 3 Fast (Lower latency)',
			'grok-3-mini': 'Grok 3 Mini (Efficient)',
			'grok-3-mini-fast': 'Grok 3 Mini Fast (Fastest)'
		},
		default: 'grok-3'
	},
	google: {
		name: 'Google',
		docs: 'https://makersuite.google.com/app/apikey',
		models: {
			'gemini-2.0-flash-exp': 'Gemini 2.0 Flash (Recommended)',
			'gemini-1.5-pro': 'Gemini 1.5 Pro',
			'gemini-1.5-flash': 'Gemini 1.5 Flash (Fast)'
		},
		default: 'gemini-2.0-flash-exp'
	},
	mistral: {
		name: 'Mistral',
		docs: 'https://console.mistral.ai/api-keys/',
		models: {
			'mistral-large-latest': 'Mistral Large (Recommended)',
			'mistral-medium-latest': 'Mistral Medium',
			'mistral-small-latest': 'Mistral Small (Fast)'
		},
		default: 'mistral-large-latest'
	}
};

function updateLLMFields() {
	const providerSelect = document.getElementById('agentic_llm_provider');
	const modelSelect = document.getElementById('agentic_model');
	const apiHelp = document.getElementById('agentic-api-key-help');
	const modelHelp = document.getElementById('agentic-model-help');

	if (!providerSelect || !modelSelect || !apiHelp || !modelHelp) {
		return;
	}

	const provider = providerSelect.value;
	const config = llmProviders[provider] || llmProviders.openai;
	const currentModel = modelSelect.dataset.currentModel || modelSelect.value;

	// Update API key help text
	apiHelp.innerHTML = `Your ${config.name} API key. Get one from <a href="${config.docs}" target="_blank">${config.docs}</a>`;

	// Update model dropdown
	modelSelect.innerHTML = '';
	for (const [value, label] of Object.entries(config.models)) {
		const option = document.createElement('option');
		option.value = value;
		option.textContent = label;
		option.selected = (value === currentModel || value === config.default);
		modelSelect.appendChild(option);
	}

	// Update model help text
	modelHelp.innerHTML = `The ${config.name} model to use for agent responses. The recommended option provides the best results.`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
	updateLLMFields();
	const providerSelect = document.getElementById('agentic_llm_provider');
	if (providerSelect) {
		providerSelect.addEventListener('change', updateLLMFields);
	}
});
