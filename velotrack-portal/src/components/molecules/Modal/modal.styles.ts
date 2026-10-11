import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const ModalStyles = css`
  .modal {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: ${theme.spacing[12]} ${theme.spacing[4]};
    overflow-y: auto;
    background: ${theme.colors.overlay};
  }

  .modal__panel {
    width: 100%;
    max-width: 32rem;
    background: ${theme.colors.neutral[0]};
    border-radius: ${theme.radius.xl};
    box-shadow: ${theme.shadows.lg};
  }

  .modal__panel--wide {
    max-width: 44rem;
  }

  .modal__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[5]} ${theme.spacing[6]} 0;
  }

  .modal__title {
    font-size: ${theme.typography.size.lg};
    font-weight: ${theme.typography.weight.bold};
  }

  .modal__description {
    margin-top: ${theme.spacing[1]};
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.sm};
  }

  .modal__close {
    display: inline-flex;
    padding: ${theme.spacing[1]};
    background: none;
    border: none;
    border-radius: ${theme.radius.md};
    color: ${theme.colors.neutral[500]};
    cursor: pointer;
  }

  .modal__close:hover {
    background: ${theme.colors.neutral[50]};
  }

  .modal__body {
    padding: ${theme.spacing[5]} ${theme.spacing[6]} ${theme.spacing[6]};
  }
`;

export default ModalStyles;
