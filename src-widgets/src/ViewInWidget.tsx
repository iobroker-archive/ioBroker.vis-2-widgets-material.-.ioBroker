import React, { type CSSProperties } from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo, VisRxWidgetState, VisRxWidgetProps } from '@iobroker/types-vis-2';

import Generic from './Generic';

const styles: Record<string, CSSProperties> = {
    overlay: {
        zIndex: 999,
        top: 0,
        bottom: 0,
        position: 'absolute',
        left: 0,
        right: 0,
    },
};

interface ViewInWidgetRxData {
    noCard: boolean;
    widgetTitle: string;
    view: string;
    button: boolean;
}

interface ViewInWidgetState extends VisRxWidgetState {
    width: number;
    height: number;
}

class ViewInWidget extends Generic<ViewInWidgetRxData, ViewInWidgetState> {
    private readonly refContainer: React.RefObject<HTMLDivElement> = React.createRef();
    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = {
            ...this.state,
            width: 0,
        };
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplMaterial2ViewInWidget',
            visSet: 'vis-2-widgets-material',
            visWidgetLabel: 'view_in_widget', // Label of widget
            visName: 'View in Widget',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'noCard',
                            label: 'without_card',
                            type: 'checkbox',
                        },
                        {
                            name: 'widgetTitle',
                            label: 'name',
                            hidden: '!!data.noCard',
                        },
                        {
                            name: 'view',
                            label: 'view',
                            type: 'select-views',
                            multiple: false,
                        },
                        {
                            name: 'button',
                            label: 'view_button',
                            type: 'checkbox',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_view.png',
        };
    }

    getWidgetInfo(): RxWidgetInfo {
        return ViewInWidget.getWidgetInfo();
    }

    componentDidMount(): void {
        super.componentDidMount();
        this.recalculateWidth();
    }

    recalculateWidth(): void {
        if (this.refContainer.current && this.refContainer.current.clientWidth !== this.state.width) {
            this.setState({
                width: this.refContainer.current.clientWidth,
            });
        }
    }

    componentWillUnmount(): void {
        super.componentWillUnmount();
    }

    componentDidUpdate(prevProps: VisRxWidgetProps, prevState: typeof this.state): void {
        super.componentDidUpdate(prevProps, prevState);
        this.recalculateWidth();
    }

    onNavigate(): void {
        window.vis.changeView(this.state.rxData.view, this.state.rxData.view);
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element[] | React.JSX.Element | null {
        super.renderWidgetBody(props);
        const view = this.state.rxData.view;

        if (view === this.props.view) {
            return (
                <div
                    className="vis-widget-body"
                    style={{ overflow: 'hidden', position: 'absolute' }}
                >
                    Cannot use recursive views
                </div>
            );
        }

        let style;

        if (this.state.width && this.state.rxData.button && this.props.refParent.current && this.refContainer.current) {
            const myWidth = this.refContainer.current.offsetWidth;
            const myHeight = this.refContainer.current.offsetHeight;
            let parentView = this.props.refParent.current;
            let count = 0;
            while (parentView.className.includes('vis-view') && count < 5) {
                parentView = parentView.parentNode as HTMLElement;
                count += 1;
            }
            if (parentView) {
                const parentWidth = parentView.offsetWidth;
                const factor = myWidth / parentWidth;

                style = {
                    transform: `scale(${factor})`,
                    transformOrigin: 'top left',
                    width: `${(1 / factor) * 100}%`,
                    height: `${(1 / factor) * 100 * (myHeight / myWidth)}%`,
                    cursor: 'pointer',
                };
            }
        }

        const noCard = this.state.rxData.noCard || props.widget.usedInWidget;

        const content = (
            <div
                style={{
                    overflow: 'hidden',
                    position: 'absolute',
                    top: !noCard && this.state.rxData.widgetTitle ? 53 : noCard ? 0 : 16,
                    left: noCard ? 0 : 8,
                    width: noCard ? '100%' : 'calc(100% - 16px)',
                    height:
                        !noCard && this.state.rxData.widgetTitle
                            ? 'calc(100% - 68px)'
                            : noCard
                              ? '100%'
                              : 'calc(100% - 32px)',
                    textAlign: 'center',
                    lineHeight: this.state.height ? `${this.state.height}px` : undefined,
                    fontFamily: this.state.rxStyle!['font-family'] as React.CSSProperties['fontFamily'],
                    textShadow: this.state.rxStyle!['text-shadow'] as React.CSSProperties['textShadow'],
                    fontStyle: this.state.rxStyle!['font-style'] as React.CSSProperties['fontStyle'],
                    fontWeight: this.state.rxStyle!['font-weight'],
                    fontVariant: this.state.rxStyle!['font-variant'] as React.CSSProperties['fontVariant'],
                }}
                ref={this.refContainer}
            >
                {this.state.editMode || this.state.rxData.button ? (
                    <div
                        style={{ ...styles.overlay, cursor: !this.state.editMode ? 'pointer' : undefined }}
                        onClick={!this.state.editMode && this.state.rxData.button ? () => this.onNavigate() : undefined}
                    />
                ) : null}
                {view ? this.getWidgetView(view, { style }) : null}
            </div>
        );

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        return this.wrapContent(content, null);
    }
}

export default ViewInWidget;
