import React, { useEffect } from 'react';
import { useTranslation, TransProps } from 'react-i18next';

interface WithTranslationProps extends TransProps<any> {
  namespaces: string[];
}

const withTranslation = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P & WithTranslationProps) => {
    const { namespaces, ...rest } = props;
    const { t, i18n } = useTranslation();

    useEffect(() => {
      i18n.loadNamespaces(namespaces);
    }, [i18n, namespaces]);

    return <Component {...(rest as P)} t={t} i18n={i18n} />;
  };
};

export default withTranslation;