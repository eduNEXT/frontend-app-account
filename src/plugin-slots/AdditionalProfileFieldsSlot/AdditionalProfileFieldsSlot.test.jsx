import { render, screen } from '@testing-library/react';
import { mergeConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

import AdditionalProfileFieldsSlot from '.';

// Use the real PluginSlot, so the plugin receives the actual pluginProps.
jest.mock('@openedx/frontend-plugin-framework', () => jest.requireActual('@openedx/frontend-plugin-framework'));

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector) => selector({ accountSettings: { values: { extended_profile: [] }, errors: {} } }),
}));

/**
 * A field shaped like the ones plugins such as the extended profile fields
 * render: it switches between its editing and default views with the
 * SwitchContent it receives.
 */
// eslint-disable-next-line react/prop-types
const TextField = ({ name, SwitchContent }) => (
  <SwitchContent
    expression="default"
    cases={{
      editing: <div>editing {name}</div>,
      default: <div data-testid={`field-${name}`}>{name}</div>,
    }}
  />
);

/** A plugin that picks each field's component by type, with the SwitchContent it receives. */
// eslint-disable-next-line react/prop-types
const Plugin = ({ formComponents: { SwitchContent } }) => (
  <>
    <SwitchContent
      expression="text"
      cases={{ text: <TextField name="favorite_color" value="red" SwitchContent={SwitchContent} /> }}
    />
    <SwitchContent
      expression="text"
      cases={{ text: <TextField name="nickname" value="" SwitchContent={SwitchContent} /> }}
    />
  </>
);

// eslint-disable-next-line react/prop-types
const FieldSlotWidget = ({ fieldName, value }) => <span data-testid={`slot-${fieldName}`}>{`${fieldName}=${value}`}</span>;

describe('AdditionalProfileFieldsSlot', () => {
  beforeEach(() => {
    mergeConfig({
      pluginSlots: {
        'org.openedx.frontend.account.additional_profile_fields.v1': {
          plugins: [{
            op: PLUGIN_OPERATIONS.Insert,
            widget: {
              id: 'plugin', type: DIRECT_PLUGIN, priority: 50, RenderWidget: Plugin,
            },
          }],
        },
        'org.openedx.frontend.account.settings_field.v1': {
          keepDefault: true,
          plugins: [{
            op: PLUGIN_OPERATIONS.Insert,
            widget: {
              id: 'widget', type: DIRECT_PLUGIN, priority: 60, RenderWidget: FieldSlotWidget,
            },
          }],
        },
      },
    });
  });

  afterEach(() => {
    mergeConfig({ pluginSlots: {} });
  });

  it('renders each plugin field once in the account settings field slot', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <AdditionalProfileFieldsSlot />
      </IntlProvider>,
    );

    const slots = container.querySelectorAll('[data-account-settings-field]');
    // One per field: the fields' own editing/default switch is not wrapped again.
    expect([...slots].map((slot) => slot.dataset.accountSettingsField)).toEqual(['favorite_color', 'nickname']);
    expect(slots[0]).toContainElement(screen.getByTestId('field-favorite_color'));
    expect(slots[1]).toContainElement(screen.getByTestId('field-nickname'));
    // The field slot's plugins run once per field, with its name and value.
    expect(screen.getAllByTestId(/^slot-/)).toHaveLength(2);
    expect(screen.getByTestId('slot-favorite_color')).toHaveTextContent('favorite_color=red');
    expect(screen.getByTestId('slot-nickname')).toHaveTextContent('nickname=');
  });
});
