import {Context} from "fluxtuate"
import GUID from "fluxtuate/lib/utils/guid"
import Delegator from "fluxtuate/lib/delegator"
import {updateFunction, nameProperty} from "fluxtuate/lib/mediator/decorators"
import {fluxtuateView as fluxtuateViewProperty, viewDelegator, mediate, viewCreated, viewDestroyed} from "fluxtuate/lib/mediator/_internals"
import React, {Component, PropTypes} from "react"
import hoistStatics from "hoist-non-react-statics"
import {readonly} from "core-decorators"

const updateState = Symbol("fluxtuateReactMediator_updateState");
const updateProps = Symbol("fluxtuateReactMediator_updateProps");

export default (component) => {
    let links = {};
    let id = GUID.generateGUID();

    class FluxtuateComponent extends component {
        constructor(props, context) {
            super(props, context);

            this[updateState] = (newState, callback) => {
                this.setState(newState, callback);
            };

            this[updateProps] = (newProps) => {
                let {linkDelegator} = links[this.props._mediatorKey];
                linkDelegator.dispatch(updateProps, newProps)
            };

            updateFunction(this, updateProps);
        }

        componentWillMount (...args){
            let {componentDelegator} = links[this.props._mediatorKey];
            componentDelegator.attachDelegate(this);

            FluxtuateLink[viewDelegator].dispatch(viewCreated, this, FluxtuateLink, this.context.fluxtuateContext);

            if(super.componentWillMount)
                super.componentWillMount.apply(this, args);
        }

        componentWillUnmount (...args){
            let {componentDelegator} = links[this.props._mediatorKey];
            componentDelegator.detachDelegate(this);
            componentDelegator.destroy();

            if(super.componentWillUnmount)
                super.componentWillUnmount.apply(this, args);

            FluxtuateLink[viewDelegator].dispatch(viewDestroyed, this, FluxtuateLink, this.context.fluxtuateContext);
        }

        @readonly
        mediate (...args){
            this[mediate].apply(this, args);
        }

        get isMediated () {
            return Boolean(this[mediate]);
        }

        static get displayName() {
            return component.name + "_" + id;
        }
    }

    FluxtuateComponent.contextTypes = {
        ...component.contextTypes,
        fluxtuateContext: PropTypes.instanceOf(Context)
    };

    let setStateKey = GUID.generateGUID();
    class FluxtuateLink extends Component {
        constructor(props, context) {
            super(props, context);


            this.state = {props: Object.assign({}, this.props)};

            this.componentWillMount = this.componentWillMount.bind(this);
            this.componentWillUnmount = this.componentWillUnmount.bind(this);
            this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);

            this[updateProps] = (newProps) => {
                this[setStateKey]({props: Object.assign(this.state.props, newProps)});
            }
        }

        componentWillMount (){
            this._mediatorKey = GUID.generateGUID();
            this.setState({
                props: Object.assign({}, this.state.props, {_mediatorKey: this._mediatorKey})
            });
            this[setStateKey] = this.setState;
            let {componentDelegator, linkDelegator} = links[this._mediatorKey] = {linkDelegator: new Delegator(), componentDelegator: new Delegator()};
            this.setState = componentDelegator.dispatch.bind(componentDelegator, updateState);
            linkDelegator.attachDelegate(this);
        }

        componentWillReceiveProps(newProps){
            let changedProps = {};
            for(let k in newProps){
                if(this.props[k] !== newProps[k]) {
                    changedProps[k] = newProps[k]
                }
            }
            if(Object.keys(changedProps).length > 0) {
                this.setState({
                    props: Object.assign(this.state.props, changedProps)
                });
            }
        }

        componentWillUnmount (){
            if(super.componentWillUnmount)
                super.componentWillUnmount();
            let {linkDelegator} = links[this._mediatorKey];
            linkDelegator.detachDelegate(this);
            linkDelegator.destroy();
        }

        render(){
            return React.createElement(FluxtuateComponent, this.state.props);
        }

        @nameProperty
        static get displayName() {
            return component.name + "_" + id;
        }
    }

    FluxtuateLink[viewDelegator] = new Delegator();

    let view = hoistStatics(FluxtuateLink, FluxtuateComponent);

    view[fluxtuateViewProperty] = true;

    return view;
};