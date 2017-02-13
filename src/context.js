import {Context} from "fluxtuate"
import React, {Component, PropTypes} from "react"
import {isFunction} from "lodash/lang"
import hoistStatics from "hoist-non-react-statics"

function createContextView(configurationClass, component, ...args) {
    if(args.length > 0) {
        throw new Error(`Context can only be applied to a react class!`);
    }

    class FluxtuateReactContext extends Component {
        static get displayName() {
            return (component.displayName || component.name) + "_fluxtuate_context";
        }

        getChildContext() {
            return { fluxtuateContext: this.fluxtuateContext };
        }

        componentWillMount() {
            this.fluxtuateContext = new Context();

            if(this.context.fluxtuateContext){
                this.context.fluxtuateContext.addChild(this.fluxtuateContext);
            }

            if(configurationClass)
                this.fluxtuateContext.config(configurationClass);
        }

        componentWillUnmount() {
            this.fluxtuateContext.destroy();
            this.fluxtuateContext = undefined;
        }

        render() {
            return React.createElement(component, Object.assign({}, this.props, {context: this.fluxtuateContext}));
        }
    }

    FluxtuateReactContext.contextTypes = {
        fluxtuateContext: PropTypes.instanceOf(Context)
    };

    FluxtuateReactContext.childContextTypes = {
        fluxtuateContext: PropTypes.instanceOf(Context)
    };

    return hoistStatics(FluxtuateReactContext, component);
}

export default (configurationClass, ...args)=>{
    if(isFunction(configurationClass.prototype.configure))
        return createContextView.bind(this, configurationClass);
    else
        return createContextView.apply(this, [undefined, configurationClass, ...args]);
}