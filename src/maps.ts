import { AttachmentBuilder, TextChannel } from 'discord.js';
import { Bot } from 'mineflayer';
import { PNG } from 'pngjs'

export default function applyMapListener(interactChannel: TextChannel, bot: Bot) {
  bot._client.on('map', ({ data }) => {
    if (!data) return
    const size = Math.sqrt(data.length); 
    if (size < 128) return
    const image = new PNG({
      width: size,
      height: size,
      colorType: 6,
      inputColorType: 6,
      inputHasAlpha: true
    });
    for (let i = 0, p = 0; i < data.length * 4; i = i + 4, p++) {
      image.data.set(getColor(data[p]), i);
    }
    const attachment = new AttachmentBuilder(PNG.sync.write(image))
    attachment.setName('map.png')
    interactChannel.send({
      files: [attachment]
    })
  });
}

const colors = [
	[0, 0, 0, 255],
	[89, 125, 39, 255],
	[109, 153, 48, 255],
	[127, 178, 56, 255],
	[67, 94, 29, 255],
	[174, 164, 115, 255],
	[213, 201, 140, 255],
	[247, 233, 163, 255],
	[130, 123, 86, 255],
	[140, 140, 140, 255],
	[171, 171, 171, 255],
	[199, 199, 199, 255],
	[105, 105, 105, 255],
	[180, 0, 0, 255],
	[220, 0, 0, 255],
	[255, 0, 0, 255],
	[135, 0, 0, 255],
	[112, 112, 180, 255],
	[138, 138, 220, 255],
	[160, 160, 255, 255],
	[84, 84, 135, 255],
	[117, 117, 117, 255],
	[144, 144, 144, 255],
	[167, 167, 167, 255],
	[88, 88, 88, 255],
	[0, 87, 0, 255],
	[0, 106, 0, 255],
	[0, 124, 0, 255],
	[0, 65, 0, 255],
	[180, 180, 180, 255],
	[220, 220, 220, 255],
	[255, 255, 255, 255],
	[135, 135, 135, 255],
	[115, 118, 129, 255],
	[141, 144, 158, 255],
	[164, 168, 184, 255],
	[86, 88, 97, 255],
	[106, 76, 54, 255],
	[130, 94, 66, 255],
	[151, 109, 77, 255],
	[79, 57, 40, 255],
	[79, 79, 79, 255],
	[96, 96, 96, 255],
	[112, 112, 112, 255],
	[59, 59, 59, 255],
	[45, 45, 180, 255],
	[55, 55, 220, 255],
	[64, 64, 255, 255],
	[33, 33, 135, 255],
	[100, 84, 50, 255],
	[123, 102, 62, 255],
	[143, 119, 72, 255],
	[75, 63, 38, 255],
	[180, 177, 172, 255],
	[220, 217, 211, 255],
	[255, 252, 245, 255],
	[135, 133, 129, 255],
	[152, 89, 36, 255],
	[186, 109, 44, 255],
	[216, 127, 51, 255],
	[114, 67, 27, 255],
	[125, 53, 152, 255],
	[153, 65, 186, 255],
	[178, 76, 216, 255],
	[94, 40, 114, 255],
	[72, 108, 152, 255],
	[88, 132, 186, 255],
	[102, 153, 216, 255],
	[54, 81, 114, 255],
	[161, 161, 36, 255],
	[197, 197, 44, 255],
	[229, 229, 51, 255],
	[121, 121, 27, 255],
	[89, 144, 17, 255],
	[109, 176, 21, 255],
	[127, 204, 25, 255],
	[67, 108, 13, 255],
	[170, 89, 116, 255],
	[208, 109, 142, 255],
	[242, 127, 165, 255],
	[128, 67, 87, 255],
	[53, 53, 53, 255],
	[65, 65, 65, 255],
	[76, 76, 76, 255],
	[40, 40, 40, 255],
	[108, 108, 108, 255],
	[132, 132, 132, 255],
	[153, 153, 153, 255],
	[81, 81, 81, 255],
	[53, 89, 108, 255],
	[65, 109, 132, 255],
	[76, 127, 153, 255],
	[40, 67, 81, 255],
	[89, 44, 125, 255],
	[109, 54, 153, 255],
	[127, 63, 178, 255],
	[67, 33, 94, 255],
	[36, 53, 125, 255],
	[44, 65, 153, 255],
	[51, 76, 178, 255],
	[27, 40, 94, 255],
	[72, 53, 36, 255],
	[88, 65, 44, 255],
	[102, 76, 51, 255],
	[54, 40, 27, 255],
	[72, 89, 36, 255],
	[88, 109, 44, 255],
	[102, 127, 51, 255],
	[54, 67, 27, 255],
	[108, 36, 36, 255],
	[132, 44, 44, 255],
	[153, 51, 51, 255],
	[81, 27, 27, 255],
	[17, 17, 17, 255],
	[21, 21, 21, 255],
	[25, 25, 25, 255],
	[13, 13, 13, 255],
	[176, 168, 54, 255],
	[215, 205, 66, 255],
	[250, 238, 77, 255],
	[132, 126, 40, 255],
	[64, 154, 150, 255],
	[79, 188, 183, 255],
	[92, 219, 213, 255],
	[48, 115, 112, 255],
	[52, 90, 180, 255],
	[63, 110, 220, 255],
	[74, 128, 255, 255],
	[39, 67, 135, 255],
	[0, 153, 40, 255],
	[0, 187, 50, 255],
	[0, 217, 58, 255],
	[0, 114, 30, 255],
	[91, 60, 34, 255],
	[111, 74, 42, 255],
	[129, 86, 49, 255],
	[68, 45, 25, 255],
	[79, 1, 0, 255],
	[96, 1, 0, 255],
	[112, 2, 0, 255],
	[59, 1, 0, 255],
	[147, 124, 113, 255],
	[180, 152, 138, 255],
	[209, 177, 161, 255],
	[110, 93, 85, 255],
	[112, 57, 25, 255],
	[137, 70, 31, 255],
	[159, 82, 36, 255],
	[84, 43, 19, 255],
	[105, 61, 76, 255],
	[128, 75, 93, 255],
	[149, 87, 108, 255],
	[78, 46, 57, 255],
	[79, 76, 97, 255],
	[96, 93, 119, 255],
	[112, 108, 138, 255],
	[59, 57, 73, 255],
	[131, 93, 25, 255],
	[160, 114, 31, 255],
	[186, 133, 36, 255],
	[98, 70, 19, 255],
	[72, 82, 37, 255],
	[88, 100, 45, 255],
	[103, 117, 53, 255],
	[54, 61, 28, 255],
	[112, 54, 55, 255],
	[138, 66, 67, 255],
	[160, 77, 78, 255],
	[84, 40, 41, 255],
	[40, 28, 24, 255],
	[49, 35, 30, 255],
	[57, 41, 35, 255],
	[30, 21, 18, 255],
	[95, 75, 69, 255],
	[116, 92, 84, 255],
	[135, 107, 98, 255],
	[71, 56, 51, 255],
	[61, 64, 64, 255],
	[75, 79, 79, 255],
	[87, 92, 92, 255],
	[46, 48, 48, 255],
	[86, 51, 62, 255],
	[105, 62, 75, 255],
	[122, 73, 88, 255],
	[64, 38, 46, 255],
	[53, 43, 64, 255],
	[65, 53, 79, 255],
	[76, 62, 92, 255],
	[40, 32, 48, 255],
	[53, 35, 24, 255],
	[65, 43, 30, 255],
	[76, 50, 35, 255],
	[40, 26, 18, 255],
	[53, 57, 29, 255],
	[65, 70, 36, 255],
	[76, 82, 42, 255],
	[40, 43, 22, 255]
];

const getColor = (colorId: number) => colors[colorId - 3] ? colors[colorId - 3] : [0, 0, 0, 0]