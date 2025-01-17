import { FC } from 'react';
import { Route } from 'react-router-dom';
import withTranslation from '@/hocs/withTranslation';

interface NamespaceRouteProps {
  namespaces: string[];
  component: React.ComponentType<any>;
  [key: string]: any;
}

const NamespaceRoute: FC<NamespaceRouteProps> = ({ namespaces, component: Component, ...rest }) => {
  const TranslatedComponent = withTranslation(Component);

  return (
    <Route
      {...rest}
      element={
        <TranslatedComponent namespaces={namespaces} />
      }
    />
  );
};

export default NamespaceRoute;