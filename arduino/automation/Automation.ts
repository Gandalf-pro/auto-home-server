import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { v4 as uuidv4 } from 'uuid';
import dataHandler from '../../dataHandler';
import Feature from '../features/Feature';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
export interface AutomationCondition {
	id: string;
	type?: 'feature' | 'time';
	featureUrl?: string;
	dataKey: string;
	operation: '>' | '<' | '<=' | '>=' | '==' | '!=' | '===' | '!==';
	value: any;
}
export type singleConditionExpressionType = '||' | '&&' | '(' | ')' | string;
export type conditionExpressionType = singleConditionExpressionType[];

export interface AutomationAction {
	featureUrl: string;
	data: { [key: string]: any };
}

export interface AutomationJson {
	id: string;
	name: string;
	timeout?: number;
	condition: { [id: string]: AutomationCondition };
	conditionExpression: conditionExpressionType;
	action: AutomationAction;
}

class Automation {
	private id: string;
	private name: string;
	private timeout?: number = 10;

	private lastExecuted?: Date;

	private condition: { [id: string]: AutomationCondition };
	private conditionExpression: conditionExpressionType;
	private action: AutomationAction;
	constructor(data: AutomationJson) {
		if (!data.id) {
			data.id = uuidv4();
		}
		this.id = data.id;
		this.name = data.name;
		if (data.timeout) this.timeout = data.timeout;
		this.condition = data.condition;
		this.conditionExpression = data.conditionExpression;
		this.action = data.action;
	}

	getId() {
		return this.id;
	}
	getName() {
		return this.name;
	}

	private isOnTimeout(): boolean {
		if (!this.lastExecuted) return false;
		const lastTime = this.lastExecuted.getTime();
		const currentTime = new Date().getTime();
		return currentTime - lastTime < this.timeout * 60 * 1000;
	}

	private featureConditionCheck(
		feature: Feature,
		condition: AutomationCondition
	) {
		let value: any;
		switch (condition.type) {
			case 'time':
				const now = dayjs();
				const tmp = {
					'<': now.isBefore.bind(now),
					'<=': now.isSameOrBefore.bind(now),
					'>': now.isAfter.bind(now),
					'>=': now.isSameOrAfter.bind(now),
					'==': now.isSame.bind(now),
					'===': now.isSame.bind(now),
					'!=': now.isSame.bind(now),
					'!==': now.isSame.bind(now),
				};
				switch (condition.dataKey) {
					case 'now':
						return tmp[condition.operation]?.(
							dayjs(condition.value)
						);
					case 'now-hour':
						const day = dayjs(condition.value);
						const givenHour = day.hour() * 60 + day.minute();
						const nowHour = now.hour() * 60 + now.minute();
						return eval(
							`${nowHour} ${condition.operation} ${givenHour}`
						);
					default:
						break;
				}
				if (condition.dataKey === 'now') {
					value = new Date();
				}
				break;
			default:
			case 'feature':
				const feaData = feature.getData();
				value = feaData?.[condition.dataKey];
				break;
		}

		const conditionValue = condition.value;
		if (!value) return false;

		let ret: boolean = false;
		switch (condition.operation) {
			case '<':
				ret = value < conditionValue;
				break;
			case '<=':
				ret = value <= conditionValue;
				break;
			case '>':
				ret = value > conditionValue;
				break;
			case '>=':
				ret = value >= conditionValue;
				break;
			case '==':
				ret = value == conditionValue;
				break;
			case '===':
				ret = value === conditionValue;
				break;
			case '!=':
				ret = value != conditionValue;
				break;
			case '!==':
				ret = value !== conditionValue;
				break;
			default:
				break;
		}
		return ret;
	}

	private isConditionMetSingle(condition: AutomationCondition) {
		const feature = dataHandler.getFeatureWithUrl(condition.featureUrl);
		let returnVal = this.featureConditionCheck(feature, condition);
		return returnVal;
	}

	isConditionMet(): boolean {
		if (!this.conditionExpression || !this.conditionExpression.length) {
			return this.isConditionMetSingle(Object.values(this.condition)[0]);
		}
		const arrWithData = this.conditionExpression.map((val) => {
			// If its not and, or, (, )

			if (val.length > 2) {
				return this.isConditionMetSingle(this.condition[val]);
			}
			return val;
		});

		return eval(arrWithData.join(' '));
	}

	async execute() {
		if (this.isOnTimeout()) return;
		if (!this.isConditionMet()) return;
		// Get the feature
		const feature = dataHandler.getFeatureWithUrl(this.action.featureUrl);
		// Set the features value
		await feature?.execute(this.action.data, 'automation');
		this.lastExecuted = new Date();
	}
}

export default Automation;
