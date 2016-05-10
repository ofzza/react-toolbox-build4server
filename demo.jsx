// Demo react-toolbox component
// ---------------------------------------------------------------------------------------------------------------------

import React from 'react'
import { AppBar, Card, CardTitle, CardText, Button, IconButton, Input, ProgressBar, Slider, Dropdown } from './react-toolbox';

export default class DemoComponent extends React.Component {
    render () {

        const GithubIcon = () => (
            <svg viewBox="0 0 284 277">
                <g><path d="M141.888675,0.0234927555 C63.5359948,0.0234927555 0,63.5477395 0,141.912168 C0,204.6023 40.6554239,257.788232 97.0321356,276.549924 C104.12328,277.86336 106.726656,273.471926 106.726656,269.724287 C106.726656,266.340838 106.595077,255.16371 106.533987,243.307542 C67.0604204,251.890693 58.7310279,226.56652 58.7310279,226.56652 C52.2766299,210.166193 42.9768456,205.805304 42.9768456,205.805304 C30.1032937,196.998939 43.9472374,197.17986 43.9472374,197.17986 C58.1953153,198.180797 65.6976425,211.801527 65.6976425,211.801527 C78.35268,233.493192 98.8906827,227.222064 106.987463,223.596605 C108.260955,214.426049 111.938106,208.166669 115.995895,204.623447 C84.4804813,201.035582 51.3508808,188.869264 51.3508808,134.501475 C51.3508808,119.01045 56.8936274,106.353063 65.9701981,96.4165325 C64.4969882,92.842765 59.6403297,78.411417 67.3447241,58.8673023 C67.3447241,58.8673023 79.2596322,55.0538738 106.374213,73.4114319 C117.692318,70.2676443 129.83044,68.6910512 141.888675,68.63701 C153.94691,68.6910512 166.09443,70.2676443 177.433682,73.4114319 C204.515368,55.0538738 216.413829,58.8673023 216.413829,58.8673023 C224.13702,78.411417 219.278012,92.842765 217.804802,96.4165325 C226.902519,106.353063 232.407672,119.01045 232.407672,134.501475 C232.407672,188.998493 199.214632,200.997988 167.619331,204.510665 C172.708602,208.913848 177.243363,217.54869 177.243363,230.786433 C177.243363,249.771339 177.078889,265.050898 177.078889,269.724287 C177.078889,273.500121 179.632923,277.92445 186.825101,276.531127 C243.171268,257.748288 283.775,204.581154 283.775,141.912168 C283.775,63.5477395 220.248404,0.0234927555 141.888675,0.0234927555" /></g>
            </svg>
        );
        const state = {
            name: '',
            phone: '',
            email: '',
            hint: '',
            progress: 30,
            buffer: 50,
            slider1: 0,
            slider2: 5,
            slider3: 1,
            albums: [
                { value: 1, artist: 'Radiohead', album: 'In Rainbows', img: 'http://www.clasesdeperiodismo.com/wp-content/uploads/2012/02/radiohead-in-rainbows.png' },
                { value: 2, artist: 'QOTSA', album: 'Sons for the Deaf', img: 'http://static.musictoday.com/store/bands/93/product_large/MUDD6669.JPG' },
                { value: 3, artist: 'Kendrick Lamar', album: 'Good Kid Maad City', img: 'https://cdn.shopify.com/s/files/1/0131/9332/products/0bd4b1846ba3890f574810dbeddddf8c.500x500x1_grande.png?v=1425070323' },
                { value: 4, artist: 'Pixies', album: 'Doolittle', img: 'http://www.resident-music.com/image/cache/data/Emilys_Packshots/Pixies/Pixies_Doolittlke-500x500.jpg' }
            ]
        };
        const style = {
            card: {
                width: '96%',
                maxWidth: '300px',
                margin: '0 2%'
            }
        };
        return (
            <div>

                <AppBar>
                    <h1>React-Toolbox Server-Side rendered project DEMO</h1>
                </AppBar>
                <span className="info">
                    Following are some examples taken from <a href="http://react-toolbox.com#/components">React-Toolbox</a>, rendered fully on the server. <br/>
                    No client-side JS is running on this page!
                </span>

                <div className="content">


                    <Card>
                        <CardTitle title="BUTTONS" subtitle="Examples from: 'http://react-toolbox.com#/components/button'"/>
                        <section style={{ padding: '5px' }}>
                            <Button href='http://react-toolbox.com' target='_blank' raised>
                                <GithubIcon /> Github
                            </Button>
                            <Button icon='bookmark' label='Bookmark' accent />
                            <Button icon='bookmark' label='Bookmark' raised primary />
                            <Button icon='inbox' label='Inbox' flat />
                            <Button icon='add' floating />
                            <Button icon='add' floating accent mini />
                            <IconButton icon='favorite' accent />
                            <IconButton primary><GithubIcon /></IconButton>
                            <Button icon='add' label='Add this' flat primary />
                            <Button icon='add' label='Add this' flat disabled />
                        </section>
                    </Card>

                    <Card>
                        <CardTitle title="INPUTS" subtitle="Examples from: 'http://react-toolbox.com#/components/input'"/>
                        <section style={{ padding: '5px' }}>
                            <section>
                                <Input type='text' label='Name' name='name' value={state.name} maxLength={16 } />
                                <Input type='text' label='Disabled field' disabled />
                                <Input type='email' label='Email address' icon='email' value={state.email} />
                                <Input type='tel' label='Phone' name='phone' icon='phone' value={state.phone}  />
                                <Input type='text' value={state.hint} label='Required Field' hint='With Hint' required icon={<span>J</span>} />
                            </section>
                        </section>
                    </Card>

                    <Card>
                        <CardTitle title="PROGRESS" subtitle="Examples from: 'http://react-toolbox.com#/components/progress_bar'"/>
                        <section style={{ padding: '5px' }}>
                            <section>
                                <p style={{margin: '5px auto'}}>Determinate</p>
                                <ProgressBar mode='determinate' value={state.progress} buffer={state.buffer}/>
                                <br/><br/>
                                <p style={{margin: '5px auto'}}>Indeterminate...</p>
                                <ProgressBar mode='indeterminate'/>
                                <br/><br/>
                                <p style={{margin: '5px auto'}}>Circular</p>
                                <ProgressBar type='circular' mode='indeterminate' multicolor />
                            </section>
                        </section>
                    </Card>

                    <Card>
                        <CardTitle title="SLIDERS" subtitle="Examples from: 'http://react-toolbox.com#/components/slider'"/>
                        <section style={{ padding: '5px' }}>
                            <section>
                                <p>Normal slider</p>
                                <Slider value={state.slider1} />
                                <br/><br/>
                                <p>With steps, initial value and editable</p>
                                <Slider min={0} max={10} editable value={state.slider2} />
                                <br/><br/>
                                <p>Pinned and with snaps</p>
                                <Slider pinned snaps min={0} max={10} step={1} editable value={state.slider3} />
                            </section>
                        </section>
                    </Card>

                    <Card>
                        <CardTitle title="DROPDOWN" subtitle="Examples from: 'http://react-toolbox.com#/components/dropdown'"/>
                        <section style={{ padding: '5px' }}>
                            <section>
                                <Dropdown
                                    auto={false}
                                    source={state.albums}
                                    label='Select your favorite album'
                                    template={(item) => {
                                        const containerStyle = {
                                          display: 'flex',
                                          flexDirection: 'row'
                                        };

                                        const imageStyle = {
                                          display: 'flex',
                                          width: '32px',
                                          height: '32px',
                                          flexGrow: 0,
                                          marginRight: '8px',
                                          backgroundColor: '#ccc'
                                        };

                                        const contentStyle = {
                                          display: 'flex',
                                          flexDirection: 'column',
                                          flexGrow: 2
                                        };

                                        return (
                                          <div style={containerStyle}>
                                            <img src={item.img} style={imageStyle}/>
                                            <div style={contentStyle}>
                                              <strong>{item.artist}</strong>
                                              <small>{item.album}</small>
                                            </div>
                                          </div>
                                        );
                                    }}
                                    value={3}
                                />
                            </section>
                        </section>
                    </Card>
                </div>

            </div>
        );
    }
}
