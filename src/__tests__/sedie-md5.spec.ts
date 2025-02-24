import { SeDieMD5, ExtraInfos } from '../assets/game/scripts/components/sedie-md5';
import { tween, UIOpacity } from 'cc';
import MD5Component, { MD5Type } from 'db://shared-components/game/md5/scripts/md5-component';

// Mock external dependencies
jest.mock('@sg/game-client-base', () => ({
    default: {
        GameServiceMessage: {
            ResultHash: jest.fn()
        }
    }
}));

jest.mock('db://shared-components/game/md5/scripts/md5-component', () => {
    const mock = jest.fn().mockImplementation(function () {
        this.lengthOfMd5 = 5;
        this.lblMd5Value = null;
        this.tipString = '';
        this.md5Tip = null;
        this.setDataTip = jest.fn();
    });

    mock.prototype.setDataTip = jest.fn();

    return {
        __esModule: true,
        default: mock,
        MD5Type: jest.fn()
    };
});

jest.mock('cc', () => ({
    tween: jest.fn().mockReturnValue({
        to: jest.fn().mockReturnThis(),
        delay: jest.fn().mockReturnThis(),
        start: jest.fn()
    }),
    UIOpacity: jest.fn(),
    _decorator: {
        ccclass: () => (target: any) => target,
        property: () => (target: any, key: string) => undefined
    }
}));

describe('SeDieMD5', () => {
    let seDieMD5: SeDieMD5;

    beforeEach(() => {
        seDieMD5 = new SeDieMD5();
        // Cast to any to access protected members for testing
        (seDieMD5 as any).lblMd5Value = {
            string: '',
            label: {},
            richText: {},
            mask: {},
            speed: 0,
        };

        (seDieMD5 as any).md5Tip = {
            setData: jest.fn(),
            show: jest.fn(),
            node: {
                getComponent: jest.fn().mockReturnValue({})
            }
        };

        (seDieMD5 as any).lengthOfMd5 = 5;
    });

    describe('generateMD5Result', () => {
        it('should generate result with extraInfos', () => {
            // Arrange
            const extraInfos: ExtraInfos = {
                red1: true,
                red2: false,
                red3: false,
                red4: false
            };
            const data: MD5Type = {
                extraInfos,
                rawValue: 'test_123456789',
                hashValue: ''
            };

            // Act
            seDieMD5.generateMD5Result(data);

            // Assert
            expect(seDieMD5.lblMd5Value.string).toBe('{<img src="chip_do" /> <img src="chip_trang" /> <img src="chip_trang" /> <img src="chip_trang" />}_12345...');
        });

        it('should generate result with hashValue', () => {
            // Arrange
            const data: MD5Type = {
                hashValue: 'abc123',
                extraInfos: { red1: false, red2: false, red3: false, red4: false },
                rawValue: ''
            };

            // Act
            seDieMD5.generateMD5Result(data);

            // Assert
            expect(seDieMD5.lblMd5Value.string).toBe('abc123');
        });
    });

    describe('generateChips', () => {
        it.each([
            [0, '<img src="chip_trang" /> <img src="chip_trang" /> <img src="chip_trang" /> <img src="chip_trang" />'],
            [1, '<img src="chip_do" /> <img src="chip_trang" /> <img src="chip_trang" /> <img src="chip_trang" />'],
            [2, '<img src="chip_do" /> <img src="chip_do" /> <img src="chip_trang" /> <img src="chip_trang" />'],
            [3, '<img src="chip_do" /> <img src="chip_do" /> <img src="chip_do" /> <img src="chip_trang" />'],
            [4, '<img src="chip_do" /> <img src="chip_do" /> <img src="chip_do" /> <img src="chip_do" />'],
        ])('should generate correct chips for %i red chips', (totalRed, expected) => {
            expect(seDieMD5.generateChips(totalRed)).toBe(expected);
        });

        it('should return empty string for invalid input', () => {
            expect(seDieMD5.generateChips(-1)).toBe('');
        });
    });

    describe('showTooltip', () => {
        beforeEach(() => {
            (seDieMD5 as any).tipString = 'test tip';
        });

        it('should show tooltip when conditions are met', () => {
            // Arrange
            (seDieMD5 as any).tipForHash = false;

            // Act
            (seDieMD5 as any).showTooltip();

            // Assert
            expect((seDieMD5 as any).md5Tip.setData).toHaveBeenCalledWith('test tip');
            expect((seDieMD5 as any).md5Tip.show).toHaveBeenCalledWith(true);
            expect(tween).toHaveBeenCalled();
        });

        it('should not show tooltip when tipForHash is true', () => {
            // Arrange
            (seDieMD5 as any).tipForHash = true;

            // Act
            (seDieMD5 as any).showTooltip();

            // Assert
            expect((seDieMD5 as any).md5Tip.setData).not.toHaveBeenCalled();
            expect((seDieMD5 as any).md5Tip.show).not.toHaveBeenCalled();
        });

        it('should not show tooltip when tipString is missing', () => {
            // Arrange
            (seDieMD5 as any).tipString = '';
            (seDieMD5 as any).tipForHash = false;

            // Act
            (seDieMD5 as any).showTooltip();

            // Assert
            expect((seDieMD5 as any).md5Tip.setData).not.toHaveBeenCalled();
            expect((seDieMD5 as any).md5Tip.show).not.toHaveBeenCalled();
        });
    });
}); 