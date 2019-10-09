import axios from 'axios'

export default (req, res) => {
  const { username, password } = req.query

  axios
    .get(`https://www.myfxbook.com/api/login.json?email=${username}&password=${password}`)
    .then(response => res.status(200).json(response.data))
    .catch(function(error) {
      // handle error
      console.log(error)
    })
}
