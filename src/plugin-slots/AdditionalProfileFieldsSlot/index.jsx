import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useDispatch, useSelector } from 'react-redux';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform';

import { fetchSettings, saveSettings } from '../../account-settings/data/actions';

import SwitchContent from '../../account-settings/SwitchContent';
import AccountSettingsFieldSlot from '../AccountSettingsFieldSlot';

/**
 * SwitchContent for the plugins in this slot. When the case it renders is a
 * field (an element with a `name` prop), it renders it in the account settings
 * field slot, so the plugins registered there apply to the plugin's fields as
 * they do to the page's own fields. Any other switch, such as a field's
 * editing and default views, renders as usual, so each field is wrapped once.
 */
const FieldSwitchContent = ({ expression = null, cases, ...props }) => {
  const content = <SwitchContent expression={expression} cases={cases} {...props} />;
  let selected = cases?.[expression] ?? cases?.default;
  if (typeof selected === 'string') { selected = cases[selected]; }
  const { name, value } = selected?.props ?? {};
  if (!name) { return content; }

  return (
    <AccountSettingsFieldSlot fieldName={name} value={value}>
      {content}
    </AccountSettingsFieldSlot>
  );
};

FieldSwitchContent.propTypes = {
  expression: PropTypes.string,
  cases: PropTypes.objectOf(PropTypes.node).isRequired,
};

const AdditionalProfileFieldsSlot = () => {
  const dispatch = useDispatch();
  const extendedProfileValues = useSelector((state) => state.accountSettings.values.extended_profile);
  const errors = useSelector((state) => state.accountSettings.errors);

  const pluginProps = {
    refreshUserProfile: (username) => dispatch(fetchSettings(username)),
    updateUserProfile: (params) => dispatch(saveSettings(null, null, snakeCaseObject(params))),
    profileFieldValues: camelCaseObject(extendedProfileValues),
    profileFieldErrors: errors,
    formComponents: {
      SwitchContent: FieldSwitchContent,
    },
  };

  return (
    <PluginSlot
      id="org.openedx.frontend.account.additional_profile_fields.v1"
      pluginProps={pluginProps}
    />
  );
};

export default AdditionalProfileFieldsSlot;
