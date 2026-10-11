import PageHeaderStyles from "./pageHeader.styles";

export type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

const PageHeaderComponent = ({
  title,
  description,
  actions,
}: PageHeaderProps) => (
  <div className="pageHeader">
    <div>
      <h1 className="pageHeader__title">{title}</h1>
      {description && <p className="pageHeader__description">{description}</p>}
    </div>
    {actions && <div className="pageHeader__actions">{actions}</div>}

    <style jsx>{PageHeaderStyles}</style>
  </div>
);

export default PageHeaderComponent;
