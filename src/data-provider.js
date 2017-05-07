import React, {Component} from "react"
import PropTypes from "prop-types"
import {inject, Mediator} from "fluxtuate"
import invokeFunction from "fluxtuate/lib/utils/invokeFunction"
import ReactView from "./view"
import ReactContext from "./context"

const defaultPropsProvider = (props) => props;

@ReactView
class FluxtuateDataProvider extends Component {
    _reactViewClass;
    _currentMediator;

    static propTypes = {
        propsProvider: PropTypes.func.isRequired,
        mediator: PropTypes.func.isRequired
    };

    static defaultProps = {
        propsProvider: defaultPropsProvider
    };

    constructor(props, context) {
        super(props, context);

        @ReactView
        class DataProviderView extends Component{
            callMediate = (...args) => {
                if(this.props.children && this.props.children.props && this.props.children.props.mediate) {
                    invokeFunction(this.props.children.props.mediate, args);
                }
                this.mediate.apply(this, args);
            };

            render() {
                let props = Object.assign({},this.props);
                delete props.mediator;
                delete props.propsProvider;

                return React.cloneElement(React.Children.only(this.props.children), Object.assign(
                    {},
                    this.props.propsProvider(props),
                    this.props.children.props,
                    {mediate: this.callMediate}
                ));
            }
        }

        this._reactViewClass = DataProviderView;
    }

    componentWillMount() {
        this.mapMediator(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.mapMediator(nextProps);
    }

    mapMediator(props) {
        if(!props.mediator) {
            throw new Error("You must provide a mediator to every DataProvider!");
        }

        if(this._currentMediator !== props.mediator) {
            if(this._currentMediator)
                this.mediate("unmap", this._reactViewClass, this._currentMediator);

            this.mediate("map", this._reactViewClass, this._currentMediator);
        }
    }

    render() {
        const ReactViewClass = this._reactViewClass;

        return <ReactViewClass>
            {this.props.children}
        </ReactViewClass>
    }
}

class DataProviderMediator extends Mediator {
    @inject
    mediatorMap;

    map(view, mediator) {
        this.mediatorMap.mapView(view, mediator);
    }

    unmap(view, mediator) {
        this.mediatorMap.unmapView(view, mediator);
    }
}

class DataProviderConfig {
    @inject
    mediatorMap;

    configure() {
        this.mediatorMap.mapView(FluxtuateDataProvider, DataProviderMediator);
    }
}

@ReactContext
export default class DataProviderContext extends Component {
    static defaultProps = {
        context: {}
    };

    componentWillMount() {
        this.props.context.config(DataProviderConfig).start();
    }

    render () {
        return <FluxtuateDataProvider {...this.props} />;
    }
}