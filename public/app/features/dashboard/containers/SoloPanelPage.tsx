// Libraries
import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

// Components
import { DashboardPanel } from '../dashgrid/DashboardPanel';

// Redux
import { initDashboard } from '../state/initDashboard';

// Types
import { StoreState, DashboardRoutes } from 'app/types';
import { PanelModel, DashboardModel } from 'app/features/dashboard/state';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

export interface DashboardPageRouteParams {
  uid?: string;
  type?: string;
  slug?: string;
}

export interface Props extends GrafanaRouteComponentProps<DashboardPageRouteParams> {
  $scope: any;
  $injector: any;
  routeName: DashboardRoutes;
  initDashboard: typeof initDashboard;
  dashboard: DashboardModel | null;
}

export interface State {
  panel: PanelModel | null;
  notFound: boolean;
}

export class SoloPanelPage extends Component<Props, State> {
  state: State = {
    panel: null,
    notFound: false,
  };

  componentDidMount() {
    const { $injector, $scope, match, route } = this.props;

    this.props.initDashboard({
      $injector: $injector,
      $scope: $scope,
      urlSlug: match.params.slug,
      urlUid: match.params.uid,
      urlType: match.params.type,
      routeName: route.routeName,
      fixUrl: false,
    });
  }

  getPanelId(): number {
    const { location } = this.props;
    const search = new URLSearchParams(location.search);
    return parseInt(search.get('panelId') ?? '0', 10);
  }

  componentDidUpdate(prevProps: Props) {
    const { dashboard } = this.props;

    if (!dashboard) {
      return;
    }

    // we just got a new dashboard
    if (!prevProps.dashboard || prevProps.dashboard.uid !== dashboard.uid) {
      const panelId = this.getPanelId();

      // need to expand parent row if this panel is inside a row
      dashboard.expandParentRowFor(panelId);

      const panel = dashboard.getPanelById(panelId);

      if (!panel) {
        this.setState({ notFound: true });
        return;
      }

      this.setState({ panel });
    }
  }

  render() {
    const { dashboard } = this.props;
    const { notFound, panel } = this.state;

    if (notFound) {
      return <div className="alert alert-error">Panel with id {this.getPanelId()} not found</div>;
    }

    if (!panel || !dashboard) {
      return <div>Loading & initializing dashboard</div>;
    }

    return (
      <div className="panel-solo">
        <DashboardPanel dashboard={dashboard} panel={panel} isEditing={false} isViewing={false} isInView={true} />
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  dashboard: state.dashboard.getModel(),
});

const mapDispatchToProps = {
  initDashboard,
};

export default hot(module)(connect(mapStateToProps, mapDispatchToProps)(SoloPanelPage));
